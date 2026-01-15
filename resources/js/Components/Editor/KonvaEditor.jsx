import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { confirmAction } from '@/Components/ConfirmDialog';
import EditorNavbar from './EditorNavbar';
import FixedContextToolbar from './FixedContextToolbar';
import EditorSidebar from './EditorSidebar';
import CanvasStage from './Canvas/CanvasStage';
import EditorResourcesDrawer from './EditorResourcesDrawer';
import EditorFooter from './EditorFooter';
import TextEffectsPanel from './TextEffectsPanel';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function KonvaEditor({ initialData, resume, userUploads }) {
    const defaultPage = {
        id: `page-${Date.now()}`,
        title: '',
        elements: initialData?.elements || [],
        locked: false,
        hidden: false
    };

    const [pages, setPages] = useState(initialData?.pages || [defaultPage]);
    const [selectedIds, setSelectedIds] = useState([]);

    // Track last effect change to prevent phantom deselections
    const lastEffectChangeRef = useRef(0);

    const handleSetSelectedIds = useCallback((ids) => {
        // If we're trying to deselect (ids=[]) shortly after applying an effect, ignore it.
        // This fixes the issue where applying an effect triggers a false "click on stage".
        if (ids.length === 0 && (Date.now() - lastEffectChangeRef.current < 500)) {
            return;
        }
        setSelectedIds(ids);

        // Auto-close effects panel if selection is cleared or not text
        if (ids.length === 0) {
            setShowEffects(false);
        } else {
            // Check if selected element is text (we need to find it in pages)
            // We'll do this in a useEffect to access 'pages' cleanly or just verify it here if possible.
            // Since accessing 'pages' inside useCallback might be stale if not in deps, let's use a useEffect watcher instead.
        }
    }, []);

    // Watch selection to auto-close panels
    useEffect(() => {
        if (selectedIds.length === 0) {
            setShowEffects(false);
        } else {
            const activeEl = pages.flatMap(p => p.elements).find(e => e.id === selectedIds[0]);
            if (activeEl && activeEl.type !== 'text') {
                setShowEffects(false);
            }
        }
    }, [selectedIds, pages]);
    const [activeTab, setActiveTab] = useState(null);
    const [saving, setSaving] = useState(false);
    const [scale, setScale] = useState(1);
    const [title, setTitle] = useState(resume.title);
    const [clipboard, setClipboard] = useState(null);
    const [showEffects, setShowEffects] = useState(false);
    const [history, setHistory] = useState([initialData?.pages || [defaultPage]]);
    const [historyStep, setHistoryStep] = useState(0);
    const [uploads, setUploads] = useState(userUploads || []);
    const [versions, setVersions] = useState([]);

    const [isHandMode, setIsHandMode] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [toolbarForceClose, setToolbarForceClose] = useState(0);
    const [showGrid, setShowGrid] = useState(false);

    const saveTimeoutRef = useRef(null);

    const saveCanvas = useCallback(async (currentPages, currentTitle) => {
        if (!currentPages || currentPages.length === 0) return;

        setSaving(true);
        try {
            // Capture snapshot for auto-save version
            const snapshot = await captureSnapshot();

            await axios.post(route('resumes.sync', resume.id), {
                canvas_state: { pages: currentPages },
                title: currentTitle,
                snapshot: snapshot
            });
            setSaving(false);
        } catch (error) {
            console.error('Sync failed:', error);
            setSaving(false);
        }
    }, [resume.id]); // captureSnapshot is called directly, not needed in deps

    useEffect(() => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveCanvas(pages, title);
        }, 1000);
        return () => clearTimeout(saveTimeoutRef.current);
    }, [pages, title, saveCanvas]);

    const stageRef = useRef();

    const exportToImage = useCallback(() => {
        if (!stageRef.current) return;

        // Hide selection before export
        const oldSelectedIds = selectedIds;
        setSelectedIds([]);

        // Brief timeout to ensure UI updates before capture
        setTimeout(() => {
            const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 }); // High quality 3x resolution
            const link = document.createElement('a');
            link.download = `${title || 'resume'}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Restore selection
            setSelectedIds(oldSelectedIds);
        }, 100);
    }, [stageRef, selectedIds, title]);

    const handleExport = useCallback(() => {
        exportToImage();
    }, [exportToImage]);

    const pushToHistory = useCallback((newPages) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(JSON.parse(JSON.stringify(newPages)));
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }, [history, historyStep]);

    const undo = useCallback(() => {
        if (historyStep > 0) {
            const prevStep = historyStep - 1;
            setHistoryStep(prevStep);
            setPages(history[prevStep]);
        }
    }, [history, historyStep]);

    const redo = useCallback(() => {
        if (historyStep < history.length - 1) {
            const nextStep = historyStep + 1;
            setHistoryStep(nextStep);
            setPages(history[nextStep]);
        }
    }, [history, historyStep]);

    const handleUpdateElement = useCallback((idOrIds, newAttrs) => {
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        setPages(prevPages => {
            const newPages = prevPages.map(page => ({
                ...page,
                elements: page.elements.map(el => ids.includes(el.id) ? { ...el, ...newAttrs } : el)
            }));
            pushToHistory(newPages);
            return newPages;
        });
    }, [pushToHistory]);

    const handleAddElement = useCallback((type, props = {}, targetPageId = null) => {
        const id = `el-${Date.now()}`;
        const newElement = {
            id,
            type,
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            fill: '#000000',
            text: type === 'text' ? 'Double click to edit' : '',
            fontSize: 20,
            ...props
        };

        const newPages = [...pages];
        if (newPages.length === 0) {
            newPages.push({ id: `page-${Date.now()}`, elements: [newElement], title: '', locked: false, hidden: false });
        } else {
            const targetIndex = targetPageId
                ? newPages.findIndex(p => p.id === targetPageId)
                : newPages.length - 1;

            const index = targetIndex === -1 ? newPages.length - 1 : targetIndex;
            newPages[index] = {
                ...newPages[index],
                elements: [...newPages[index].elements, newElement]
            };
        }

        setPages(newPages);
        pushToHistory(newPages);
        setSelectedIds([id]);
    }, [pages, pushToHistory]);

    const handleUpload = useCallback(async (file, shouldAddToCanvas = false) => {
        const formData = new FormData();
        formData.append('profile_image', file);
        setIsUploading(true);

        try {
            const response = await axios.post(route('user-details.upload-image'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.url) {
                setUploads(prev => [response.data.url, ...prev]);
                if (shouldAddToCanvas) {
                    handleAddElement('image', {
                        src: response.data.url,
                        width: 250,
                        height: 250
                    });
                }
                return response.data.url;
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, [handleAddElement]);

    const handleDeleteUpload = useCallback(async (url) => {
        const confirmed = await confirmAction({
            title: 'Delete Image?',
            message: 'Are you sure you want to delete this image? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete'
        });
        if (!confirmed) return;

        try {
            await axios.delete(route('user-details.delete-image'), {
                data: { path: url }
            });
            setUploads(prev => prev.filter(item => item !== url));
            toast.success('Image deleted successfully');
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete image.');
        }
    }, []);

    const fetchVersions = useCallback(async () => {
        try {
            const response = await axios.get(route('resumes.versions.index', resume.id));
            setVersions(response.data);
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        }
    }, [resume.id]);

    const captureSnapshot = useCallback(async () => {
        if (!stageRef.current || !stageRef.current.getStage) {
            console.warn('captureSnapshot: stageRef or getStage not ready');
            return null;
        }

        const stage = stageRef.current.getStage();
        if (!stage) {
            console.warn('captureSnapshot: Konva Stage not found');
            return null;
        }

        // Note: We are keeping the selection visible in the snapshot to avoid UI flickering/deselection bugs.
        // In the future, we can implement a way to hide the transformer layer specifically during capture.

        try {
            const dataURL = stage.toDataURL({
                pixelRatio: 0.5, // Balance quality and size
            });
            return dataURL;
        } catch (error) {
            console.error('captureSnapshot: Failed to generate dataURL:', error);
            // toast.error("Snapshot failed: " + error.message); // Suppress toast for background saves
            return null;
        }
    }, []);

    const handleSaveExplicitVersion = useCallback(async (name) => {
        setSaving(true);
        try {
            console.log('handleSaveExplicitVersion: Starting...');
            const snapshot = await captureSnapshot();
            console.log('handleSaveExplicitVersion: Snapshot captured:', snapshot ? `${snapshot.substring(0, 50)}... (length: ${snapshot.length})` : 'NULL');

            const response = await axios.post(route('resumes.versions.store', resume.id), {
                canvas_state: { pages },
                name: name || `Version ${new Date().toLocaleString()}`,
                snapshot: snapshot
            });
            setVersions(prev => [response.data.version, ...prev]);
            toast.success('Version saved with snapshot!');
        } catch (error) {
            console.error('Failed to save version:', error);
            toast.error('Failed to save version.');
        } finally {
            setSaving(false);
        }
    }, [resume.id, pages, captureSnapshot]);

    const handleDeleteVersion = useCallback(async (versionId) => {
        const confirmed = await confirmAction({
            title: 'Delete Version?',
            message: 'Are you sure you want to delete this version? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete'
        });

        if (!confirmed) return;

        try {
            await axios.delete(route('resumes.versions.destroy', versionId));
            setVersions(prev => prev.filter(v => v.id !== versionId));
            toast.success('Version deleted successfully');
        } catch (error) {
            console.error('Failed to delete version:', error);
            toast.error('Failed to delete version.');
        }
    }, []);

    const handleRestoreVersion = useCallback(async (versionId) => {
        const confirmed = await confirmAction({
            title: 'Restore Version?',
            message: 'Are you sure you want to restore this version? This will overwrite your current work.',
            type: 'warning',
            confirmText: 'Restore'
        });
        if (!confirmed) return;

        setSaving(true);
        try {
            const response = await axios.post(route('resumes.versions.restore', versionId));
            const newPages = response.data.resume.canvas_state.pages || [defaultPage];
            setPages(newPages);
            pushToHistory(newPages);
            setSelectedIds([]);
            toast.success('Version restored');
        } catch (error) {
            console.error('Failed to restore version:', error);
            toast.error('Failed to restore version.');
        } finally {
            setSaving(false);
        }
    }, [pushToHistory, defaultPage]);

    const handleDeleteElement = useCallback(() => {
        if (selectedIds.length === 0) return;
        const newPages = pages.map(page => ({
            ...page,
            elements: page.elements.filter(el => !selectedIds.includes(el.id))
        }));
        setPages(newPages);
        pushToHistory(newPages);
        setSelectedIds([]);
    }, [selectedIds, pages, pushToHistory]);

    const handleDuplicateElement = useCallback(() => {
        if (selectedIds.length === 0) return;

        const newPages = [...pages];
        const newSelectedIds = [];

        newPages.forEach(page => {
            const duplicatedElements = [];
            page.elements.forEach(el => {
                if (selectedIds.includes(el.id)) {
                    const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    duplicatedElements.push({
                        ...el,
                        id: newId,
                        x: el.x + 20,
                        y: el.y + 20
                    });
                    newSelectedIds.push(newId);
                }
            });
            page.elements = [...page.elements, ...duplicatedElements];
        });

        setPages(newPages);
        pushToHistory(newPages);
        setSelectedIds(newSelectedIds);
    }, [selectedIds, pages, pushToHistory]);

    const [clipboardStyle, setClipboardStyle] = useState(null);

    const handleNudge = useCallback((dx, dy) => {
        if (selectedIds.length === 0) return;

        setPages(prev => prev.map(page => ({
            ...page,
            elements: page.elements.map(el =>
                (selectedIds.includes(el.id) && !el.locked)
                    ? { ...el, x: el.x + dx, y: el.y + dy }
                    : el
            )
        })));
    }, [selectedIds]);

    const handleLayerAction = useCallback((action, payload) => {
        if (selectedIds.length === 0 && action !== 'reorder') return;

        const newPages = pages.map(page => {
            let newElements = [...page.elements];

            if (action === 'reorder') {
                const { id, targetIndex } = payload;
                const currentIndex = newElements.findIndex(el => el.id === id);
                if (currentIndex !== -1) {
                    const [element] = newElements.splice(currentIndex, 1);
                    newElements.splice(targetIndex, 0, element);
                }
            } else {
                const selectedInPage = newElements.filter(el => selectedIds.includes(el.id));
                const unselectedInPage = newElements.filter(el => !selectedIds.includes(el.id));

                if (selectedInPage.length === 0) return page;

                selectedInPage.sort((a, b) => page.elements.indexOf(a) - page.elements.indexOf(b));

                if (action === 'front') {
                    newElements = [...unselectedInPage, ...selectedInPage];
                } else if (action === 'back') {
                    newElements = [...selectedInPage, ...unselectedInPage];
                } else if (action === 'forward') {
                    if (selectedIds.length === 1) {
                        const index = page.elements.findIndex(el => el.id === selectedIds[0]);
                        if (index < page.elements.length - 1) {
                            const el = newElements[index];
                            newElements.splice(index, 1);
                            newElements.splice(index + 1, 0, el);
                        }
                    }
                } else if (action === 'backward') {
                    if (selectedIds.length === 1) {
                        const index = page.elements.findIndex(el => el.id === selectedIds[0]);
                        if (index > 0) {
                            const el = newElements[index];
                            newElements.splice(index, 1);
                            newElements.splice(index - 1, 0, el);
                        }
                    }
                }
            }
            return { ...page, elements: newElements };
        });

        setPages(newPages);
        pushToHistory(newPages);
    }, [selectedIds, pages, pushToHistory]);

    const handleAlign = useCallback((alignment) => {
        if (selectedIds.length === 0) return;
        const PAGE_WIDTH = 595;
        const PAGE_HEIGHT = 842;

        const newPages = pages.map(page => ({
            ...page,
            elements: page.elements.map(el => {
                if (!selectedIds.includes(el.id) || el.locked) return el;

                const width = (el.width || 100) * (el.scaleX || 1);
                const height = (el.height || 100) * (el.scaleY || 1);

                let newX = el.x;
                let newY = el.y;

                if (alignment === 'left') newX = 0;
                if (alignment === 'right') newX = PAGE_WIDTH - width;
                if (alignment === 'top') newY = 0;
                if (alignment === 'bottom') newY = PAGE_HEIGHT - height;
                if (alignment === 'center-h' || alignment === 'center') newX = (PAGE_WIDTH - width) / 2;
                if (alignment === 'center-v' || alignment === 'middle') newY = (PAGE_HEIGHT - height) / 2;

                return { ...el, x: newX, y: newY };
            })
        }));

        setPages(newPages);
        pushToHistory(newPages);
    }, [selectedIds, pages, pushToHistory]);

    const handleLockToggle = useCallback(() => {
        if (selectedIds.length === 0) return;
        const newPages = pages.map(page => ({
            ...page,
            elements: page.elements.map(el =>
                selectedIds.includes(el.id) ? { ...el, locked: !el.locked } : el
            )
        }));
        setPages(newPages);
        pushToHistory(newPages);
    }, [selectedIds, pages, pushToHistory]);

    const handleCopyStyle = useCallback(() => {
        if (selectedIds.length !== 1) return;
        let foundElement = null;
        pages.forEach(page => {
            const el = page.elements.find(e => e.id === selectedIds[0]);
            if (el) foundElement = el;
        });

        if (foundElement) {
            const { x, y, id, type, text, ...style } = foundElement;
            setClipboardStyle(style);
        }
    }, [selectedIds, pages]);

    const handlePasteStyle = useCallback(() => {
        if (selectedIds.length === 0 || !clipboardStyle) return;
        const newPages = pages.map(page => ({
            ...page,
            elements: page.elements.map(el =>
                selectedIds.includes(el.id) ? { ...el, ...clipboardStyle } : el
            )
        }));
        setPages(newPages);
        pushToHistory(newPages);
    }, [selectedIds, pages, clipboardStyle, pushToHistory]);

    const handleCopy = useCallback(() => {
        if (selectedIds.length === 0) return;
        const selectedElements = [];
        pages.forEach(page => {
            page.elements.forEach(el => {
                if (selectedIds.includes(el.id)) selectedElements.push(el);
            });
        });
        setClipboard(selectedElements);
    }, [selectedIds, pages]);

    const handlePaste = useCallback(() => {
        if (!clipboard || clipboard.length === 0) return;

        const newPages = [...pages];
        const newSelectedIds = [];

        // Paste into the last page for now
        if (newPages.length === 0) return; // Should not happen

        const lastPage = newPages[newPages.length - 1];
        const pastedElements = clipboard.map(item => {
            const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            newSelectedIds.push(newId);
            return {
                ...item,
                id: newId,
                x: item.x + 20,
                y: item.y + 20
            };
        });

        lastPage.elements = [...lastPage.elements, ...pastedElements];
        setPages(newPages);
        setSelectedIds(newSelectedIds);
    }, [clipboard, pages]);

    const updatePageTitle = (pageId, newTitle) => {
        const newPages = pages.map(page =>
            page.id === pageId ? { ...page, title: newTitle } : page
        );
        setPages(newPages);
        // Don't push to history for every keystroke, but auto-save will catch it
    };

    const handlePageAction = useCallback(async (pageId, action) => {
        let newPages = [...pages];
        const pageIndex = newPages.findIndex(p => p.id === pageId);
        if (pageIndex === -1 && action !== 'add') return;

        switch (action) {
            case 'moveUp':
                if (pageIndex > 0) {
                    const [page] = newPages.splice(pageIndex, 1);
                    newPages.splice(pageIndex - 1, 0, page);
                }
                break;
            case 'moveDown':
                if (pageIndex < newPages.length - 1) {
                    const [page] = newPages.splice(pageIndex, 1);
                    newPages.splice(pageIndex + 1, 0, page);
                }
                break;
            case 'lock':
                newPages[pageIndex] = { ...newPages[pageIndex], locked: !newPages[pageIndex].locked };
                break;
            case 'duplicate':
                const pageToClone = newPages[pageIndex];
                const clonedPage = JSON.parse(JSON.stringify(pageToClone));
                clonedPage.id = `page-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                // Deep clone elements with new IDs to avoid conflicts
                clonedPage.elements = clonedPage.elements.map(el => ({
                    ...el,
                    id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
                }));
                newPages.splice(pageIndex + 1, 0, clonedPage);
                break;
            case 'delete':
                if (newPages[pageIndex].locked) {
                    toast.warning("Page is Locked", {
                        description: "Please unlock the page first before deleting it."
                    });
                    return;
                }
                if (newPages.length > 1) {
                    const confirmed = await confirmAction({
                        title: 'Delete Page?',
                        message: 'Are you sure you want to delete this page? This action cannot be undone.',
                        type: 'danger',
                        confirmText: 'Delete'
                    });
                    if (!confirmed) return;

                    newPages.splice(pageIndex, 1);
                    toast.success('Page deleted');
                } else {
                    toast.error("Can't delete last page", {
                        description: "Your resume must have at least one page."
                    });
                    return;
                }
                break;
            case 'add':
                const newPage = {
                    id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    title: '',
                    elements: [],
                    locked: false,
                    hidden: false
                };
                if (pageIndex !== -1) {
                    newPages.splice(pageIndex + 1, 0, newPage);
                } else {
                    newPages.push(newPage);
                }
                break;
            case 'hide':
                newPages[pageIndex] = { ...newPages[pageIndex], hidden: !newPages[pageIndex].hidden };
                break;
            default:
                break;
        }

        setPages(newPages);
        pushToHistory(newPages);
    }, [pages, pushToHistory]);

    const handleCut = useCallback(() => {
        if (selectedIds.length === 0) return;
        handleCopy();
        handleDeleteElement();
    }, [selectedIds, handleCopy, handleDeleteElement]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') return;

            if (e.code === 'Space' && !e.repeat && !isSpacePressed) {
                e.preventDefault();
                setIsSpacePressed(true);
                setIsHandMode(true);
            }

            if (e.key === 'Enter' && selectedIds.length === 1 && !e.shiftKey) {
                const element = activeSelection;
                if (element?.type === 'text') {
                    // Trigger editing in CanvasStage via some mechanism
                    // Since editingId is local to CanvasStage, we might need to lift it or use a ref
                    // For now, let's look at how CanvasStage is used
                    if (stageRef.current?.startEditing) {
                        stageRef.current.startEditing(element.id);
                    }
                }
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

            if (cmdOrCtrl) {
                if (e.key === '=' || e.key === '+') {
                    e.preventDefault();
                    setScale(s => Math.min(3, s + 0.1));
                    return;
                }
                if (e.key === '-' || e.key === '_') {
                    e.preventDefault();
                    setScale(s => Math.max(0.1, s - 0.1));
                    return;
                }
                if (e.key === '0') {
                    e.preventDefault();
                    setScale(1);
                    return;
                }
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) redo();
                    else undo();
                    return;
                }
                if (e.key === 'y') {
                    e.preventDefault();
                    redo();
                    return;
                }
                if (e.key === 'c') {
                    e.preventDefault();
                    handleCopy();
                }
                if (e.key === 'x') {
                    e.preventDefault();
                    handleCut();
                }
                if (e.key === 'v') {
                    e.preventDefault();
                    handlePaste();
                }
                if (e.key === 'd') {
                    e.preventDefault();
                    handleDuplicateElement();
                }
            }

            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    handleDeleteElement();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handleNudge(e.shiftKey ? -10 : -1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleNudge(e.shiftKey ? 10 : 1, 0);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    handleNudge(0, e.shiftKey ? -10 : -1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    handleNudge(0, e.shiftKey ? 10 : 1);
                    break;
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
                setIsHandMode(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleDeleteElement, handleDuplicateElement, handleNudge, handleCopy, handlePaste, handleCut, undo, redo, isSpacePressed]);

    const handleDeleteResume = () => {
        if (confirm('Are you sure you want to delete this resume?')) {
            router.delete(route('resumes.destroy', resume.id));
        }
    };

    const activeSelection = useMemo(() => {
        if (selectedIds.length === 0) return null;
        const lastId = selectedIds[selectedIds.length - 1];
        for (const page of pages) {
            const el = page.elements.find(e => e.id === lastId);
            if (el) return el;
        }
        return null;
    }, [selectedIds, pages]);

    return (
        <div className={`flex flex-col h-screen w-screen bg-[#0E1318] text-white overflow-hidden select-none ${isHandMode ? 'cursor-grab active:cursor-grabbing' : ''}`}>
            <EditorNavbar
                resumeTitle={title}
                onTitleChange={setTitle}
                saving={saving}
                onDownload={handleExport}
                onDelete={handleDeleteResume}
                onUndo={undo}
                onRedo={redo}
                canUndo={historyStep > 0}
                canRedo={historyStep < history.length - 1}
                onHistoryClick={() => {
                    setActiveTab('history');
                    fetchVersions();
                }}
            />

            {/* Fixed Context Toolbar */}
            <FixedContextToolbar
                selection={activeSelection}
                selectedIds={selectedIds}
                pages={pages}
                onSelect={handleSetSelectedIds}
                onStyleChange={handleUpdateElement}
                onAlign={handleAlign}
                onLayerAction={handleLayerAction}
                forceClose={toolbarForceClose}
                showEffects={showEffects}
                setShowEffects={setShowEffects}
            />

            {/* Text Effects Side Panel */}
            <AnimatePresence>
                {showEffects && (
                    <TextEffectsPanel
                        key="text-effects-panel"
                        selection={activeSelection}
                        onClose={() => setShowEffects(false)}
                        onEffectChange={(effectData) => {
                            lastEffectChangeRef.current = Date.now();
                            const updates = {};
                            if (effectData.effectType !== undefined) {
                                updates.effectType = effectData.effectType;
                                updates.effectParams = effectData.effectParams;
                            }
                            if (effectData.shapeType !== undefined) {
                                updates.shapeType = effectData.shapeType;
                                updates.shapeCurve = effectData.shapeCurve;
                            }
                            if (effectData.background !== undefined) {
                                updates.background = effectData.background;
                            }

                            if (Object.keys(updates).length > 0) {
                                handleUpdateElement(selectedIds, updates);
                            }
                        }}
                    />
                )}
            </AnimatePresence>

            <div className="flex flex-1 overflow-hidden relative">
                <EditorSidebar
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                        setActiveTab(tab);
                        if (tab) setToolbarForceClose(prev => prev + 1);
                    }}
                />

                {activeTab && (
                    <EditorResourcesDrawer
                        activeTab={activeTab}
                        onAddElement={handleAddElement}
                        userUploads={uploads}
                        onUpload={handleUpload}
                        onDeleteUpload={handleDeleteUpload}
                        isUploading={isUploading}
                        versions={versions}
                        onSaveVersion={handleSaveExplicitVersion}
                        onRestoreVersion={handleRestoreVersion}
                        onDeleteVersion={handleDeleteVersion}
                        onClose={() => setActiveTab(null)}
                    />
                )}

                <div className="flex-1 flex flex-col relative bg-gray-100 pb-10">
                    <CanvasStage
                        ref={stageRef}
                        pages={pages}
                        selectedIds={selectedIds}
                        onSelect={handleSetSelectedIds}
                        onUpdateElement={handleUpdateElement}
                        onAddElementAt={handleAddElement}
                        onUpload={handleUpload}
                        scale={scale}
                        onScaleChange={setScale}
                        stageRef={stageRef}
                        isHandMode={isHandMode}
                        onDelete={handleDeleteElement}
                        onDuplicate={handleDuplicateElement}
                        onAlign={handleAlign}
                        onLayerAction={handleLayerAction}
                        showGrid={showGrid}
                        onPageAction={handlePageAction}
                        onUpdatePageTitle={updatePageTitle}
                    />

                    {/* Canva-style Footer */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <EditorFooter
                            scale={scale}
                            onScaleChange={setScale}
                            onFitToPage={() => stageRef.current?.fitToPage()}
                            onToggleGrid={() => setShowGrid(!showGrid)}
                            showGrid={showGrid}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
}
