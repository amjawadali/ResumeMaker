import { useState, useCallback, useRef } from 'react';

export const DEFAULT_PAGE = {
    id: `page-temp-${Date.now()}`,
    title: '',
    elements: [],
    locked: false,
    hidden: false
};

/**
 * Hook to manage Konva canvas history (undo/redo) with modular states.
 * @param {Array} initialPages - Initial pages array.
 */
export function useEditorHistory(initialPages = []) {
    const [pages, setPagesState] = useState(initialPages.length > 0 ? initialPages : [DEFAULT_PAGE]);
    const [history, setHistory] = useState([JSON.parse(JSON.stringify(initialPages.length > 0 ? initialPages : [DEFAULT_PAGE]))]);
    const [historyStep, setHistoryStep] = useState(0);
    const lastPushedTime = useRef(0);

    const pushToHistory = useCallback((newPages) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyStep + 1);
            // Deep clone to prevent state mutation leaks
            newHistory.push(JSON.parse(JSON.stringify(newPages)));
            
            // Limit history size to 50 steps
            if (newHistory.length > 50) {
                newHistory.shift();
                setHistoryStep(newHistory.length - 1);
            } else {
                setHistoryStep(newHistory.length - 1);
            }
            return newHistory;
        });
        lastPushedTime.current = Date.now();
    }, [historyStep]);

    const setPages = useCallback((newPagesOrFn, shouldPush = true) => {
        setPagesState(prev => {
            const next = typeof newPagesOrFn === 'function' ? newPagesOrFn(prev) : newPagesOrFn;
            if (shouldPush) {
                pushToHistory(next);
            }
            return next;
        });
    }, [pushToHistory]);

    // Alias for updating without history (e.g. for live dragging)
    const setPagesSilent = useCallback((newPagesOrFn) => {
        setPages(newPagesOrFn, false);
    }, [setPages]);

    const commitHistory = useCallback(() => {
        setPagesState(current => {
            pushToHistory(current);
            return current;
        });
    }, [pushToHistory]);

    const undo = useCallback(() => {
        if (historyStep > 0) {
            const prevStep = historyStep - 1;
            setHistoryStep(prevStep);
            setPagesState(JSON.parse(JSON.stringify(history[prevStep])));
        }
    }, [history, historyStep]);

    const redo = useCallback(() => {
        if (historyStep < history.length - 1) {
            const nextStep = historyStep + 1;
            setHistoryStep(nextStep);
            setPagesState(JSON.parse(JSON.stringify(history[nextStep])));
        }
    }, [history, historyStep]);

    return {
        pages,
        setPages,
        setPagesSilent,
        commitHistory,
        undo,
        redo,
        canUndo: historyStep > 0,
        canRedo: historyStep < history.length - 1,
        historyStep,
        history,
        defaultPage: DEFAULT_PAGE
    };
}
