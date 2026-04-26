import { useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

/**
 * useAutoSave hook
 * Debounced auto-save to localStorage + optional server sync.
 *
 * @param {object} data - The data object to watch for changes
 * @param {string} key - localStorage key prefix
 * @param {function} onSave - Optional server save callback (receives data)
 * @param {number} delay - Debounce delay in ms (default: 2000)
 */
export default function useAutoSave(data, key, onSave, delay = 2000) {
    const dataRef = useRef(data);
    const isDirtyRef = useRef(false);

    useEffect(() => {
        dataRef.current = data;
        isDirtyRef.current = true;
    }, [data]);

    const saveToLocal = useCallback(() => {
        try {
            localStorage.setItem(`autosave_${key}`, JSON.stringify({
                data: dataRef.current,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('AutoSave localStorage failed:', e);
        }
    }, [key]);

    const saveToServer = useCallback(() => {
        if (onSave && isDirtyRef.current) {
            onSave(dataRef.current);
            isDirtyRef.current = false;
        }
    }, [onSave]);

    const debouncedSave = useRef(
        debounce(() => {
            saveToLocal();
            saveToServer();
        }, delay)
    ).current;

    useEffect(() => {
        debouncedSave();
        return () => debouncedSave.cancel();
    }, [data, debouncedSave]);

    const restore = useCallback(() => {
        try {
            const saved = localStorage.getItem(`autosave_${key}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.data;
            }
        } catch (e) {
            console.warn('AutoSave restore failed:', e);
        }
        return null;
    }, [key]);

    const clear = useCallback(() => {
        localStorage.removeItem(`autosave_${key}`);
    }, [key]);

    return { restore, clear };
}
