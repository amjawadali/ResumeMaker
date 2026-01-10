import React, { useState, useEffect, useCallback, useRef } from 'react';
import EditorNavbar from './EditorNavbar';
import FixedContextToolbar from './FixedContextToolbar';
import EditorSidebar from './EditorSidebar';
import CanvasStage from './Canvas/CanvasStage';
import EditorResourcesDrawer from './EditorResourcesDrawer';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function KonvaEditor({ initialData, resume, userUploads }) {
    const [elements, setElements] = useState(initialData?.elements || []);
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeTab, setActiveTab] = useState(null); // Closed by default
    const [saving, setSaving] = useState(false);
    const [scale, setScale] = useState(0.8);
    const [title, setTitle] = useState(resume.title);
    const [clipboard, setClipboard] = useState(null);
    const [history, setHistory] = useState([initialData?.elements || []]);
    const [historyStep, setHistoryStep] = useState(0);
    const [uploads, setUploads] = useState(userUploads || []);

    // Hand tool state
    const [isHandMode, setIsHandMode] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [toolbarForceClose, setToolbarForceClose] = useState(0);

    const saveTimeoutRef = useRef(null);

    // Auto-save logic (Sync Bridge)
    const saveCanvas = useCallback(async (currentElements, currentTitle) => {
        if (!currentElements || currentElements.length === 0) return;

        console.log('Attempting auto-save...', { elementsCount: currentElements.length });
        setSaving(true);
        try {
            const response = await axios.post(route('resumes.sync', resume.id), {
                canvas_state: { elements: currentElements },
                title: currentTitle
            });
            console.log('Auto-save successful:', response.data.message);
            setSaving(false);
        } catch (error) {
            console.error('Sync failed:', error);
            setSaving(false);
        }
    }, [resume.id]);

    useEffect(() => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
            saveCanvas(elements, title);
        }, 1000); // 1 second debounce for better UX

        return () => clearTimeout(saveTimeoutRef.current);
    }, [elements, title, saveCanvas]);

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

    const pushToHistory = useCallback((newElements) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(JSON.parse(JSON.stringify(newElements)));
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }, [history, historyStep]);

    const undo = useCallback(() => {
        if (historyStep > 0) {
            const prevStep = historyStep - 1;
            setHistoryStep(prevStep);
            setElements(history[prevStep]);
        }
    }, [history, historyStep]);

    const redo = useCallback(() => {
        if (historyStep < history.length - 1) {
            const nextStep = historyStep + 1;
            setHistoryStep(nextStep);
            setElements(history[nextStep]);
        }
    }, [history, historyStep]);

    const handleUpdateElement = (idOrIds, newAttrs) => {
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        const newElements = elements.map(el => ids.includes(el.id) ? { ...el, ...newAttrs } : el);
        setElements(newElements);
        pushToHistory(newElements);
    };

    const handleAddElement = useCallback((type, props = {}) => {
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
        const newElements = [...elements, newElement];
        setElements(newElements);
        pushToHistory(newElements);
        setSelectedIds([id]);
    }, [elements, pushToHistory]);

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
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, [handleAddElement]);

    const handleDeleteUpload = useCallback(async (url) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await axios.delete(route('user-details.delete-image'), {
                data: { path: url }
            });
            setUploads(prev => prev.filter(item => item !== url));
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete image.');
        }
    }, []);

    const handleDeleteElement = useCallback(() => {
        if (selectedIds.length === 0) return;
        const newElements = elements.filter(el => !selectedIds.includes(el.id));
        setElements(newElements);
        pushToHistory(newElements);
        setSelectedIds([]);
    }, [selectedIds, elements, pushToHistory]);

    const handleDuplicateElement = useCallback(() => {
        if (selectedIds.length === 0) return;

        const newElements = [...elements];
        const newSelectedIds = [];

        selectedIds.forEach(id => {
            const element = elements.find(el => el.id === id);
            if (!element) return;

            const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const duplicatedElement = {
                ...element,
                id: newId,
                x: element.x + 20,
                y: element.y + 20,
            };
            newElements.push(duplicatedElement);
            newSelectedIds.push(newId);
        });

        setElements(newElements);
        pushToHistory(newElements);
        setSelectedIds(newSelectedIds);
    }, [selectedIds, elements, pushToHistory]);

    const [clipboardStyle, setClipboardStyle] = useState(null);

    const handleNudge = useCallback((dx, dy) => {
        if (selectedIds.length === 0) return;

        setElements(prev => prev.map(el =>
            (selectedIds.includes(el.id) && !el.locked)
                ? { ...el, x: el.x + dx, y: el.y + dy }
                : el
        ));
    }, [selectedIds]);

    const handleLayerAction = useCallback((action, payload) => {
        if (selectedIds.length === 0 && action !== 'reorder') return;

        let newElements = [...elements];

        if (action === 'reorder') {
            const { id, targetIndex } = payload;
            const currentIndex = newElements.findIndex(el => el.id === id);
            if (currentIndex !== -1) {
                const [element] = newElements.splice(currentIndex, 1);
                newElements.splice(targetIndex, 0, element);
            }
        } else {
            const selectedElements = newElements.filter(el => selectedIds.includes(el.id));
            const unselectedElements = newElements.filter(el => !selectedIds.includes(el.id));

            selectedElements.sort((a, b) => elements.indexOf(a) - elements.indexOf(b));

            if (action === 'front') {
                newElements = [...unselectedElements, ...selectedElements];
            } else if (action === 'back') {
                newElements = [...selectedElements, ...unselectedElements];
            } else if (action === 'forward') {
                if (selectedIds.length === 1) {
                    const index = elements.findIndex(el => el.id === selectedIds[0]);
                    if (index < elements.length - 1) {
                        const el = newElements[index];
                        newElements.splice(index, 1);
                        newElements.splice(index + 1, 0, el);
                    }
                }
            } else if (action === 'backward') {
                if (selectedIds.length === 1) {
                    const index = elements.findIndex(el => el.id === selectedIds[0]);
                    if (index > 0) {
                        const el = newElements[index];
                        newElements.splice(index, 1);
                        newElements.splice(index - 1, 0, el);
                    }
                }
            }
        }

        setElements(newElements);
        pushToHistory(newElements);
    }, [selectedIds, elements, pushToHistory]);

    const handleAlign = useCallback((alignment) => {
        if (selectedIds.length === 0) return;
        const PAGE_WIDTH = 595;
        const PAGE_HEIGHT = 842;

        const newElements = elements.map(el => {
            if (!selectedIds.includes(el.id) || el.locked) return el;

            const width = el.width || 100;
            const height = el.height || 100;

            let newX = el.x;
            let newY = el.y;

            if (alignment === 'left') newX = 0;
            if (alignment === 'right') newX = PAGE_WIDTH - width;
            if (alignment === 'top') newY = 0;
            if (alignment === 'bottom') newY = PAGE_HEIGHT - height;
            if (alignment === 'center-h') newX = (PAGE_WIDTH - width) / 2;
            if (alignment === 'center-v') newY = (PAGE_HEIGHT - height) / 2;

            return { ...el, x: newX, y: newY };
        });

        setElements(newElements);
        pushToHistory(newElements);
    }, [selectedIds, elements, pushToHistory]);

    const handleLockToggle = useCallback(() => {
        if (selectedIds.length === 0) return;
        const newElements = elements.map(el =>
            selectedIds.includes(el.id) ? { ...el, locked: !el.locked } : el
        );
        setElements(newElements);
        pushToHistory(newElements);
    }, [selectedIds, elements, pushToHistory]);

    const handleCopyStyle = useCallback(() => {
        if (selectedIds.length !== 1) return;
        const element = elements.find(el => el.id === selectedIds[0]);
        if (element) {
            const { x, y, id, type, text, ...style } = element;
            setClipboardStyle(style);
        }
    }, [selectedIds, elements]);

    const handlePasteStyle = useCallback(() => {
        if (selectedIds.length === 0 || !clipboardStyle) return;
        const newElements = elements.map(el =>
            selectedIds.includes(el.id) ? { ...el, ...clipboardStyle } : el
        );
        setElements(newElements);
        pushToHistory(newElements);
    }, [selectedIds, elements, clipboardStyle, pushToHistory]);

    const handleCopy = useCallback(() => {
        if (selectedIds.length === 0) return;
        const selectedElements = elements.filter(el => selectedIds.includes(el.id));
        setClipboard(selectedElements);
    }, [selectedIds, elements]);

    const handlePaste = useCallback(() => {
        if (!clipboard || clipboard.length === 0) return;

        const newElements = [...elements];
        const newSelectedIds = [];

        clipboard.forEach(item => {
            const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            newElements.push({
                ...item,
                id: newId,
                x: item.x + 20,
                y: item.y + 20
            });
            newSelectedIds.push(newId);
        });

        setElements(newElements);
        setSelectedIds(newSelectedIds);
    }, [clipboard, elements]);

    const handleCut = useCallback(() => {
        if (selectedIds.length === 0) return;
        handleCopy();
        handleDeleteElement();
    }, [selectedIds, handleCopy, handleDeleteElement]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.code === 'Space' && !e.repeat && !isSpacePressed) {
                e.preventDefault();
                setIsSpacePressed(true);
                setIsHandMode(true);
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

    const activeSelection = selectedIds.length > 0
        ? elements.find(el => el.id === selectedIds[selectedIds.length - 1])
        : null;

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
            />

            {/* Fixed Context Toolbar */}
            <FixedContextToolbar
                selection={activeSelection}
                selectedIds={selectedIds}
                elements={elements}
                onSelect={setSelectedIds}
                onStyleChange={handleUpdateElement}
                onAlign={handleAlign}
                onLayerAction={handleLayerAction}
                forceClose={toolbarForceClose}
            />

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
                        onClose={() => setActiveTab(null)}
                    />
                )}

                <div className="flex-1 flex flex-col relative bg-gray-100">
                    {/* Zoom Controls */}
                    <div className="absolute bottom-6 right-6 z-40 flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-lg">
                        <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="w-7 h-7 hover:bg-gray-100 rounded flex items-center justify-center font-bold text-gray-700">−</button>
                        <span className="text-xs font-medium w-12 text-center text-gray-700">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="w-7 h-7 hover:bg-gray-100 rounded flex items-center justify-center font-bold text-gray-700">+</button>
                    </div>

                    <CanvasStage
                        elements={elements}
                        selectedIds={selectedIds}
                        onSelect={setSelectedIds}
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
                    />
                </div>
            </div>
        </div >
    );
}
