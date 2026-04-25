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
import ImageEditorPanel from './Panels/ImageEditorPanel';
import ShapeEditorPanel from './Panels/ShapeEditorPanel';
import PublishModal from './PublishModal';
import { router } from '@inertiajs/react';
import axios from 'axios';

// Hooks
import { useEditorHistory } from '@/Hooks/Editor/useEditorHistory';
import { useSelection } from '@/Hooks/Editor/useSelection';
import { useEditorShortcuts } from '@/Hooks/Editor/useEditorShortcuts';
import { useAutosave } from '@/Hooks/Editor/useAutosave';
import { useTelemetry } from '@/Hooks/useTelemetry';

export default function KonvaEditor({ initialData, resume, userUploads, mode = 'resume', mockData = null, profile = null }) {
    const stageRef = useRef();
    const { fireEvent } = useTelemetry();

    // Track editing session start
    useEffect(() => {
        fireEvent('edit_started', mode === 'developer' ? 'Template' : 'Resume', mode === 'developer' ? initialData?.id : resume.id);
    }, []);
    
    // 1. History & Pages State
    const { 
        pages, setPages, setPagesSilent, 
        undo, redo, canUndo, canRedo, 
        historyStep, history, defaultPage
    } = useEditorHistory(initialData?.pages);

    // 2. Selection State
    const { 
        selectedIds, setSelectedIds, 
        activeSelection, clearSelection 
    } = useSelection(pages);

    // Track last effect change to prevent phantom deselections
    const lastEffectChangeRef = useRef(0);

    const handleSetSelectedIds = useCallback((ids) => {
        // If we're trying to deselect (ids=[]) shortly after applying an effect, ignore it.
        if (ids.length === 0 && (Date.now() - lastEffectChangeRef.current < 500)) {
            return;
        }
        setSelectedIds(ids);
    }, [setSelectedIds]);

    // Watch selection to auto-close panels
    useEffect(() => {
        if (selectedIds.length === 0) {
            setShowEffects(false);
        } else {
            const activeEl = pages.flatMap(p => p.elements).find(e => e.id === selectedIds[0]);
            const supportedTypes = ['text', 'image', 'rect', 'star', 'polygon', 'triangle', 'circle'];
            if (activeEl && !supportedTypes.includes(activeEl.type)) {
                setShowEffects(false);
            }
        }
    }, [selectedIds, pages]);

    const [activeTab, setActiveTab] = useState(null);
    const [scale, setScale] = useState(1);
    const [title, setTitle] = useState(resume.title);
    const [clipboard, setClipboard] = useState(null);
    const [showEffects, setShowEffects] = useState(false);
    const [uploads, setUploads] = useState(userUploads || []);
    const [versions, setVersions] = useState([]);

    const [isHandMode, setIsHandMode] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [toolbarForceClose, setToolbarForceClose] = useState(0);
    const [showGrid, setShowGrid] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

    const handlePublish = async (metadata) => {
        try {
            // Capture high-quality preview for marketplace
            const snapshot = await stageRef.current.getStage().toDataURL({ pixelRatio: 2 });
            
            await axios.post(route('templates.publish'), {
                ...metadata,
                canvas_data: { pages },
                preview_image: snapshot,
                resume_id: resume.id
            });
            
            fireEvent('template_published', 'Template', null, { title: metadata.title });
            
            toast.success('Submitted for moderation! You will be notified once it is approved.');
            setIsPublishModalOpen(false);
        } catch (error) {
            console.error('Publishing failed:', error);
            toast.error(error.response?.data?.message || 'Failed to submit template.');
            throw error;
        }
    };

    // 3. Autosave Synchronization
    const { saving, triggerManualSave } = useAutosave({ pages, title }, {
        delay: 2000,
        onSave: async (data, signal) => {
            const snapshot = await captureSnapshot();
            await axios.post(route('resumes.sync', resume.id), {
                canvas_state: { pages: data.pages },
                title: data.title,
                snapshot: snapshot
            }, { signal });
        }
    });

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

            fireEvent('export_png', mode === 'developer' ? 'Template' : 'Resume', mode === 'developer' ? initialData?.id : resume.id);
        }, 100);
    }, [stageRef, selectedIds, title]);

    const handleExport = useCallback(() => {
        exportToImage();
    }, [exportToImage]);


    const handleUpdateElement = useCallback((idOrIds, newAttrs, shouldCommit = true) => {
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        setPages(prevPages => {
            return prevPages.map(page => ({
                ...page,
                elements: page.elements.map(el => ids.includes(el.id) ? { ...el, ...newAttrs } : el)
            }));
        }, shouldCommit);
    }, [setPages]);

    const handleAddElement = useCallback((type, props = {}, targetPageId = null) => {
        const id = `el-${Date.now()}`;
        const newElement = {
            id,
            type,
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            fill: type === 'image' ? null : '#000000',
            text: type === 'text' ? 'Double click to edit' : '',
            fontSize: 20,
            // Frame-specific defaults
            ...(type === 'frame' ? {
                frameShape: props.frameShape || 'circle',
                fillPatternImage: null,
                fillPatternScale: { x: 1, y: 1 },
                fillPatternOffset: { x: 0, y: 0 },
                fill: '#e0e0e0', // Placeholder fill
                stroke: '#999999',
                strokeWidth: 2,
            } : {}),
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
        setSelectedIds([id]);
    }, [pages, setPages, setSelectedIds]);

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
            setSelectedIds([]);
            toast.success('Version restored');
        } catch (error) {
            console.error('Failed to restore version:', error);
            toast.error('Failed to restore version.');
        } finally {
            setSaving(false);
        }
    }, [setPages, defaultPage, setSelectedIds]);

    const handleDeleteElement = useCallback(() => {
        if (selectedIds.length === 0) return;
        const newPages = pages.map(page => ({
            ...page,
            elements: page.elements.filter(el => !selectedIds.includes(el.id))
        }));
        setPages(newPages);
        setSelectedIds([]);
    }, [selectedIds, pages, setPages, setSelectedIds]);

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
        setSelectedIds(newSelectedIds);
    }, [selectedIds, pages, setPages, setSelectedIds]);

    const [clipboardStyle, setClipboardStyle] = useState(null);

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
    }, [selectedIds, pages, setPages]);

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
    }, [selectedIds, pages, setPages]);

    const handleLockToggle = useCallback(() => {
        if (selectedIds.length === 0) return;
        const newPages = pages.map(page => ({
            ...page,
            elements: page.elements.map(el =>
                selectedIds.includes(el.id) ? { ...el, locked: !el.locked } : el
            )
        }));
        setPages(newPages);
    }, [selectedIds, pages, setPages]);

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
    }, [selectedIds, pages, clipboardStyle, setPages]);

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

        // Paste into the last page for now (or active page if tracked)
        if (newPages.length === 0) return;

        // Determine target page: either the one with selection or the last one
        let targetPageIndex = newPages.length - 1;
        if (selectedIds.length > 0) {
            const idx = newPages.findIndex(p => p.elements.some(el => selectedIds.includes(el.id)));
            if (idx !== -1) targetPageIndex = idx;
        }
        const targetPage = newPages[targetPageIndex];

        const pasteOffset = 20;

        const pasteRecursive = (elements) => elements.map(item => {
            const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newItem = {
                ...item,
                id: newId,
                x: item.x + pasteOffset,
                y: item.y + pasteOffset
            };
            if (newItem.type === 'group' && newItem.elements) {
                newItem.elements = pasteRecursive(newItem.elements);
            }
            // Top level items get tracked for selection
            if (elements === clipboard) newSelectedIds.push(newId);
            return newItem;
        });

        // This logic is slightly broken because map returns array, but we need to track IDs only for top level.
        // Let's refactor simple loop for top level.
        const pastedElements = clipboard.map(item => {
            const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            newSelectedIds.push(newId);

            const cloneWithNewIds = (el) => {
                const elId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                const newEl = { ...el, id: elId };
                if (newEl.type === 'group' && newEl.elements) {
                    newEl.elements = newEl.elements.map(child => cloneWithNewIds(child));
                }
                return newEl;
            }

            // Clone children if group
            let newItem = { ...item, id: newId, x: item.x + pasteOffset, y: item.y + pasteOffset };
            if (newItem.type === 'group' && newItem.elements) {
                newItem.elements = newItem.elements.map(child => cloneWithNewIds(child));
            }
            return newItem;
        });

        targetPage.elements = [...targetPage.elements, ...pastedElements];
        setPages(newPages);
        setSelectedIds(newSelectedIds);
    }, [clipboard, pages, selectedIds]);

    const updatePageTitle = (pageId, newTitle) => {
        const newPages = pages.map(page =>
            page.id === pageId ? { ...page, title: newTitle } : page
        );
        setPages(newPages);
    };


    const handleGroup = useCallback(() => {
        if (selectedIds.length < 2) return;

        let newGroupId = null;

        const newPages = pages.map(page => {
            const selectedInPage = page.elements.filter(el => selectedIds.includes(el.id));
            if (selectedInPage.length < 2) return page;

            selectedInPage.sort((a, b) => page.elements.indexOf(a) - page.elements.indexOf(b));

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            selectedInPage.forEach(el => {
                minX = Math.min(minX, el.x);
                minY = Math.min(minY, el.y);
                const w = (el.width || 0) * (el.scaleX || 1);
                const h = (el.height || 0) * (el.scaleY || 1);
                maxX = Math.max(maxX, el.x + w);
                maxY = Math.max(maxY, el.y + h);
            });

            newGroupId = `group-${Date.now()}`;
            const groupX = minX;
            const groupY = minY;
            const groupW = maxX - minX;
            const groupH = maxY - minY;

            const groupElement = {
                id: newGroupId,
                type: 'group',
                x: groupX,
                y: groupY,
                width: groupW,
                height: groupH,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                elements: selectedInPage.map(el => ({
                    ...el,
                    x: el.x - groupX,
                    y: el.y - groupY
                }))
            };

            const remaining = page.elements.filter(el => !selectedIds.includes(el.id));
            return {
                ...page,
                elements: [...remaining, groupElement]
            };
        });

        setPages(newPages);
        if (newGroupId) {
            setSelectedIds([newGroupId]);
        }
    }, [selectedIds, pages, setPages, setSelectedIds]);

    const handleUngroup = useCallback(() => {
        if (selectedIds.length !== 1) return;
        const groupId = selectedIds[0];

        let ungroupedIds = [];

        const newPages = pages.map(page => {
            const groupEl = page.elements.find(el => el.id === groupId && el.type === 'group');
            if (!groupEl) return page;

            const children = groupEl.elements.map(child => {
                const childAbsX = groupEl.x + child.x;
                const childAbsY = groupEl.y + child.y;

                const newChild = {
                    ...child,
                    x: childAbsX,
                    y: childAbsY
                };
                ungroupedIds.push(newChild.id);
                return newChild;
            });

            const idx = page.elements.indexOf(groupEl);
            const newElements = [...page.elements];
            newElements.splice(idx, 1, ...children);

            return { ...page, elements: newElements };
        });

        if (ungroupedIds.length > 0) {
            setPages(newPages);
            setSelectedIds(ungroupedIds);
        }
    }, [selectedIds, pages, setPages, setSelectedIds]);

    const handleNudge = useCallback((dx, dy) => {
        if (selectedIds.length === 0) return;
        setPages(pages.map(page => ({
            ...page,
            elements: page.elements.map(el =>
                (selectedIds.includes(el.id) && !el.locked)
                    ? { ...el, x: el.x + dx, y: el.y + dy }
                    : el
            )
        })));
    }, [selectedIds, pages, setPages]);

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
                break;
            case 'duplicate':
                const pageToClone = newPages[pageIndex];
                const clonedPage = JSON.parse(JSON.stringify(pageToClone));
                clonedPage.id = `page-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                // Deep clone elements with new IDs to avoid conflicts
                const renewIds = (elements) => elements.map(el => {
                    const newEl = { ...el, id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
                    if (newEl.type === 'group' && newEl.elements) {
                        newEl.elements = renewIds(newEl.elements);
                    }
                    return newEl;
                });
                clonedPage.elements = renewIds(clonedPage.elements);

                newPages.splice(pageIndex + 1, 0, clonedPage);
                break;
            case 'lock':
                newPages[pageIndex] = { ...newPages[pageIndex], locked: !newPages[pageIndex].locked };
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
    }, [pages, setPages]);

    const handleCut = useCallback(() => {
        if (selectedIds.length === 0) return;
        handleCopy();
        handleDeleteElement();
    }, [selectedIds, handleCopy, handleDeleteElement]);

    const handleDeleteResume = () => {
        if (confirm('Are you sure you want to delete this resume?')) {
            router.delete(route('resumes.destroy', resume.id));
        }
    };

    // 4. Keyboard Shortcuts
    useEditorShortcuts({
        undo,
        redo,
        copy: handleCopy,
        paste: handlePaste,
        cut: handleCut,
        duplicate: handleDuplicateElement,
        delete: handleDeleteElement,
        group: handleGroup,
        ungroup: handleUngroup,
        nudge: handleNudge,
        zoomIn: () => setScale(s => Math.min(3, s + 0.1)),
        zoomOut: () => setScale(s => Math.max(0.1, s - 0.1)),
        resetZoom: () => setScale(1),
        save: triggerManualSave,
        activeSelection,
        startEditing: (id) => stageRef.current?.startEditing?.(id),
        setHandMode: setIsHandMode
    }, [
        undo, redo, handleCopy, handlePaste, handleCut, 
        handleDuplicateElement, handleDeleteElement, 
        handleGroup, handleUngroup, handleNudge, 
        triggerManualSave, activeSelection
    ]);

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
                onPublish={() => setIsPublishModalOpen(true)}
            />

            <PublishModal
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                onPublish={handlePublish}
                initialTitle={title}
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
                onGroup={handleGroup}
                onUngroup={handleUngroup}
            />

            {/* Effects Side Panel (Text or Image) */}
            <AnimatePresence>
                {showEffects && activeSelection?.type === 'text' && (
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

                {showEffects && activeSelection?.type === 'image' && (
                    <ImageEditorPanel
                        key="image-editor-panel"
                        selection={activeSelection}
                        onClose={() => setShowEffects(false)}
                        onUpdate={(updates) => {
                            lastEffectChangeRef.current = Date.now();
                            handleUpdateElement(selectedIds, updates);
                        }}
                    />
                )}

                {showEffects && ['rect', 'star', 'polygon', 'triangle', 'circle'].includes(activeSelection?.type) && (
                    <ShapeEditorPanel
                        key="shape-editor-panel"
                        selection={activeSelection}
                        onClose={() => setShowEffects(false)}
                        onUpdate={(id, updates) => {
                            lastEffectChangeRef.current = Date.now();
                            handleUpdateElement(selectedIds, updates); // Use selectedIds instead of id to be safe/consistent
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
                        onUpload={handleUpload}
                        onDeleteUpload={handleDeleteUpload}
                        userUploads={uploads}
                        isUploading={isUploading}
                        onClose={() => setActiveTab(null)}
                        versions={versions}
                        onSaveVersion={handleSaveExplicitVersion}
                        onRestoreVersion={handleRestoreVersion}
                        onDeleteVersion={handleDeleteVersion}
                        profile={profile}
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
                        clipboard={clipboard}
                        onCopy={handleCopy}
                        onCut={handleCut}
                        onPaste={handlePaste}
                        mode={mode}
                        mockData={mockData}
                    />

                    {/* Canva-style Footer */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <EditorFooter
                            scale={scale}
                            onScaleChange={setScale}
                            onFitToPage={() => stageRef.current?.fitToPage()}
                            onToggleGrid={() => setShowGrid(!showGrid)}
                            showGrid={showGrid}
                            totalPages={pages.length}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
}
