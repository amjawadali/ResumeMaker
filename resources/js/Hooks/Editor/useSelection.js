import { useState, useCallback, useMemo } from 'react';

/**
 * Hook to manage element selection state.
 * @param {Array} pages - Current canvas pages to find active element.
 */
export function useSelection(pages) {
    const [selectedIds, setSelectedIds] = useState([]);

    const handleSetSelectedIds = useCallback((ids) => {
        const newIds = typeof ids === 'function' ? ids(selectedIds) : ids;
        setSelectedIds(newIds);
    }, [selectedIds]);

    const activeSelection = useMemo(() => {
        if (!selectedIds || selectedIds.length === 0) return null;
        const lastId = selectedIds[selectedIds.length - 1];
        
        for (const page of pages) {
            const el = page.elements.find(e => e.id === lastId);
            if (el) return el;
        }
        return null;
    }, [selectedIds, pages]);

    const clearSelection = useCallback(() => setSelectedIds([]), []);

    return {
        selectedIds,
        setSelectedIds: handleSetSelectedIds,
        activeSelection,
        clearSelection
    };
}
