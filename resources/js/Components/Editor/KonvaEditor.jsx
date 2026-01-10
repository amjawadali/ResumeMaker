import React, { useState, useEffect, useCallback, useRef } from 'react';
import EditorNavbar from './EditorNavbar';
import EditorToolbar from './EditorToolbar';
import EditorSidebar from './EditorSidebar';
import CanvasStage from './Canvas/CanvasStage';
import EditorResourcesDrawer from './EditorResourcesDrawer';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function KonvaEditor({ initialData, resume, userUploads }) {
    const [elements, setElements] = useState(initialData?.elements || []);
    const [selectedId, setSelectedId] = useState(null);
    const [activeTab, setActiveTab] = useState('design');
    const [saving, setSaving] = useState(false);
    const [scale, setScale] = useState(0.8);
    const [title, setTitle] = useState(resume.title);
    const [clipboard, setClipboard] = useState(null);
    const [history, setHistory] = useState([initialData?.elements || []]);
    const [historyStep, setHistoryStep] = useState(0);

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
        const oldSelectedId = selectedId;
        setSelectedId(null);

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
            setSelectedId(oldSelectedId);
        }, 100);
    }, [stageRef, selectedId, title]);

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

    const handleUpdateElement = (id, newAttrs) => {
        const newElements = elements.map(el => el.id === id ? { ...el, ...newAttrs } : el);
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
        setSelectedId(id);
    }, [elements, pushToHistory]);

    const handleDeleteElement = useCallback(() => {
        if (!selectedId) return;
        const newElements = elements.filter(el => el.id !== selectedId);
        setElements(newElements);
        pushToHistory(newElements);
        setSelectedId(null);
    }, [selectedId, elements, pushToHistory]);

    const handleDuplicateElement = useCallback(() => {
        if (!selectedId) return;
        const element = elements.find(el => el.id === selectedId);
        if (!element) return;

        const newId = `el-${Date.now()}`;
        const duplicatedElement = {
            ...element,
            id: newId,
            x: element.x + 20,
            y: element.y + 20,
        };
        const newElements = [...elements, duplicatedElement];
        setElements(newElements);
        pushToHistory(newElements);
        setSelectedId(newId);
    }, [selectedId, elements, pushToHistory]);

    const [clipboardStyle, setClipboardStyle] = useState(null);

    const handleNudge = useCallback((dx, dy) => {
        if (!selectedId) return;
        const index = elements.findIndex(el => el.id === selectedId);
        if (index === -1 || elements[index].locked) return;

        setElements(prev => prev.map(el =>
            el.id === selectedId ? { ...el, x: el.x + dx, y: el.y + dy } : el
        ));
    }, [selectedId, elements]);

    const handleLayerAction = useCallback((action) => {
        if (!selectedId) return;
        const index = elements.findIndex(el => el.id === selectedId);
        if (index === -1) return;

        let newElements = [...elements];
        const element = newElements[index];
        newElements.splice(index, 1);

        if (action === 'front') {
            newElements.push(element);
        } else if (action === 'back') {
            newElements.unshift(element);
        } else if (action === 'forward') {
            newElements.splice(Math.min(newElements.length, index + 1), 0, element);
        } else if (action === 'backward') {
            newElements.splice(Math.max(0, index - 1), 0, element);
        }

        setElements(newElements);
        pushToHistory(newElements);
    }, [selectedId, elements, pushToHistory]);

    const handleAlign = useCallback((alignment) => {
        if (!selectedId) return;
        const PAGE_WIDTH = 595;
        const PAGE_HEIGHT = 842;

        const newElements = elements.map(el => {
            if (el.id !== selectedId || el.locked) return el;

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
    }, [selectedId, elements, pushToHistory]);

    const handleLockToggle = useCallback(() => {
        if (!selectedId) return;
        const newElements = elements.map(el =>
            el.id === selectedId ? { ...el, locked: !el.locked } : el
        );
        setElements(newElements);
        pushToHistory(newElements);
    }, [selectedId, elements, pushToHistory]);

    const handleCopyStyle = useCallback(() => {
        if (!selectedId) return;
        const element = elements.find(el => el.id === selectedId);
        if (element) {
            const { x, y, id, type, text, ...style } = element;
            setClipboardStyle(style);
        }
    }, [selectedId, elements]);

    const handlePasteStyle = useCallback(() => {
        if (!selectedId || !clipboardStyle) return;
        const newElements = elements.map(el =>
            el.id === selectedId ? { ...el, ...clipboardStyle } : el
        );
        setElements(newElements);
        pushToHistory(newElements);
    }, [selectedId, elements, clipboardStyle, pushToHistory]);

    const handleCopy = useCallback(() => {
        if (!selectedId) return;
        const element = elements.find(el => el.id === selectedId);
        if (element) {
            setClipboard({ ...element });
        }
    }, [selectedId, elements]);

    const handlePaste = useCallback(() => {
        if (!clipboard) return;
        const newId = `el-${Date.now()}`;
        const pastedElement = {
            ...clipboard,
            id: newId,
            x: clipboard.x + 20,
            y: clipboard.y + 20,
        };
        setElements(prev => [...prev, pastedElement]);
        setSelectedId(newId);
    }, [clipboard]);

    const handleCut = useCallback(() => {
        if (!selectedId) return;
        const element = elements.find(el => el.id === selectedId);
        if (element) {
            setClipboard({ ...element });
            handleDeleteElement();
        }
    }, [selectedId, elements, handleDeleteElement]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

            // Zoom shortcuts (Ctrl + + / -)
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
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                    return;
                }
                if (e.key === 'y') {
                    e.preventDefault();
                    redo();
                    return;
                }
            }

            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    handleDeleteElement();
                    break;
                case 'c':
                    if (cmdOrCtrl) {
                        e.preventDefault();
                        handleCopy();
                    }
                    break;
                case 'x':
                    if (cmdOrCtrl) {
                        e.preventDefault();
                        handleCut();
                    }
                    break;
                case 'v':
                    if (cmdOrCtrl) {
                        e.preventDefault();
                        handlePaste();
                    }
                    break;
                case 'd':
                    if (cmdOrCtrl) {
                        e.preventDefault();
                        handleDuplicateElement();
                    }
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
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDeleteElement, handleDuplicateElement, handleNudge, handleCopy, handlePaste, handleCut, undo, redo]);

    const handleDeleteResume = () => {
        if (confirm('Are you sure you want to delete this resume?')) {
            router.delete(route('resumes.destroy', resume.id));
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-[#0E1318] text-white overflow-hidden select-none">
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

            {selectedId && (
                <EditorToolbar
                    selection={elements.find(el => el.id === selectedId)}
                    onStyleChange={handleUpdateElement}
                    onLayerAction={handleLayerAction}
                    onAlign={handleAlign}
                    onLockToggle={handleLockToggle}
                    onFormatPainter={handleCopyStyle}
                />
            )}

            <div className="flex flex-1 overflow-hidden relative">
                <EditorSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {activeTab && (
                    <div className="w-80 h-full">
                        <EditorResourcesDrawer
                            activeTab={activeTab}
                            onAddElement={handleAddElement}
                            userUploads={userUploads}
                        />
                    </div>
                )}

                <div className="flex-1 flex flex-col relative bg-[#18191B]">
                    {/* Zoom Controls (Canva style) */}
                    <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2 bg-[#252627] p-1.5 rounded-lg border border-white/10 shadow-xl">
                        <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="w-8 h-8 hover:bg-white/10 rounded flex items-center justify-center font-bold">-</button>
                        <span className="text-[10px] font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="w-8 h-8 hover:bg-white/10 rounded flex items-center justify-center font-bold">+</button>
                    </div>

                    <CanvasStage
                        elements={elements}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onUpdateElement={handleUpdateElement}
                        onAddElementAt={handleAddElement}
                        scale={scale}
                        onScaleChange={setScale}
                        stageRef={stageRef}
                    />
                </div>
            </div>
        </div >
    );
}
