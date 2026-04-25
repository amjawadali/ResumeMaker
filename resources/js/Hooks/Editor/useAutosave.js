import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Hook to manage autosave synchronization with the backend.
 * @param {any} data - The data to watch for changes.
 * @param {Object} options - Options including onSave callback, enabled flag, and delay.
 */
export function useAutosave(data, { onSave, enabled = true, delay = 1000 }) {
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [error, setError] = useState(null);
    
    const timeoutRef = useRef(null);
    const abortControllerRef = useRef(null);
    const lastDataHash = useRef('');

    const save = useCallback(async (currentData) => {
        // Simple hash check to avoid saving identical data (shallow check of the data object)
        const currentHash = JSON.stringify(currentData);
        if (currentHash === lastDataHash.current) return;

        // Cancel previous request if still in flight
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setSaving(true);
        setError(null);

        try {
            await onSave(currentData, abortControllerRef.current.signal);
            setLastSaved(new Date());
            lastDataHash.current = currentHash;
        } catch (err) {
            if (axios.isCancel(err) || err.name === 'AbortError') {
                // Ignore cancellation
                return;
            }
            console.error('Autosave failed:', err);
            setError(err.response?.data?.message || 'Failed to sync changes');
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setSaving(false);
                abortControllerRef.current = null;
            }
        }
    }, [onSave]);

    useEffect(() => {
        if (!enabled || !data) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        timeoutRef.current = setTimeout(() => {
            save(data);
        }, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [data, enabled, delay, save]);

    return { saving, lastSaved, error, triggerManualSave: () => save(data) };
}
