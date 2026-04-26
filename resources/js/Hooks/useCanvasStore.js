import { useState, useCallback, useRef } from 'react';

/**
 * useCanvasStore
 * Extracts core canvas state management from KonvaEditor into a reusable hook.
 * This is a stepping stone toward a full Zustand/Redux store.
 */
export default function useCanvasStore(initialPages = [{ id: 'page-1', elements: [] }]) {
    const [pages, setPages] = useState(initialPages);
    const [selectedIds, setSelectedIds] = useState([]);
    const [history, setHistory] = useState([JSON.stringify(initialPages)]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const stagePosRef = useRef({ x: 0, y: 0 });
    const scaleRef = useRef(1);

    const pushHistory = useCallback((newPages) => {
        const serialized = JSON.stringify(newPages);
        setHistory(prev => {
            const next = prev.slice(0, historyIndex + 1);
            if (next.length >= 50) next.shift();
            next.push(serialized);
            return next;
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, [historyIndex]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const undo = useCallback(() => {
        if (!canUndo) return;
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setPages(JSON.parse(history[newIndex]));
        setSelectedIds([]);
    }, [canUndo, history, historyIndex]);

    const redo = useCallback(() => {
        if (!canRedo) return;
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setPages(JSON.parse(history[newIndex]));
        setSelectedIds([]);
    }, [canRedo, history, historyIndex]);

    const updatePages = useCallback((updater) => {
        setPages(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            pushHistory(next);
            return next;
        });
    }, [pushHistory]);

    const addElement = useCallback((pageId, element) => {
        updatePages(prev => prev.map(p =>
            p.id === pageId
                ? { ...p, elements: [...p.elements, { ...element, id: element.id || `${element.type}-${Date.now()}` }] }
                : p
        ));
    }, [updatePages]);

    const updateElement = useCallback((elementId, updates, pageId = null) => {
        const updateInList = (elements) => elements.map(el => {
            if (el.id === elementId) return { ...el, ...updates };
            if (el.type === 'group' && el.elements) {
                return { ...el, elements: updateInList(el.elements) };
            }
            return el;
        });

        updatePages(prev => prev.map(p => {
            if (pageId && p.id !== pageId) return p;
            return { ...p, elements: updateInList(p.elements) };
        }));
    }, [updatePages]);

    const removeElement = useCallback((elementId) => {
        const removeFromList = (elements) => elements.filter(el => {
            if (el.id === elementId) return false;
            if (el.type === 'group' && el.elements) {
                el.elements = removeFromList(el.elements);
            }
            return true;
        });

        updatePages(prev => prev.map(p => ({
            ...p,
            elements: removeFromList(p.elements)
        })));
        setSelectedIds(prev => prev.filter(id => id !== elementId));
    }, [updatePages]);

    const selectElement = useCallback((id, multi = false) => {
        setSelectedIds(prev => {
            if (multi) {
                return prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
            }
            return [id];
        });
    }, []);

    const deselectAll = useCallback(() => {
        setSelectedIds([]);
    }, []);

    const getElementById = useCallback((id, pageList = pages) => {
        for (const page of pageList) {
            for (const el of page.elements) {
                if (el.id === id) return el;
                if (el.type === 'group' && el.elements) {
                    const found = el.elements.find(e => e.id === id);
                    if (found) return found;
                }
            }
        }
        return null;
    }, [pages]);

    const setStagePos = useCallback((pos) => {
        stagePosRef.current = pos;
    }, []);

    const setScale = useCallback((s) => {
        scaleRef.current = s;
    }, []);

    return {
        pages,
        selectedIds,
        history,
        historyIndex,
        canUndo,
        canRedo,
        undo,
        redo,
        updatePages,
        addElement,
        updateElement,
        removeElement,
        selectElement,
        deselectAll,
        getElementById,
        setStagePos,
        setScale,
        stagePos: stagePosRef.current,
        scale: scaleRef.current,
    };
}
