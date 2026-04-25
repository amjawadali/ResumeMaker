import { useCallback } from 'react';
import axios from 'axios';

const session_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Simple native debounce implementation to avoid lodash dependency
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export const useTelemetry = () => {
    const fireEvent = useCallback(async (eventType, modelType = null, modelId = null, metadata = {}) => {
        try {
            await axios.post(route('telemetry.store'), {
                event_type: eventType,
                model_type: modelType,
                model_id: modelId,
                metadata: metadata,
                session_id: session_id
            });
        } catch (error) {
            // Silently fail telemetry - don't disrupt user experience
            console.error('Telemetry failed:', error);
        }
    }, []);

    // Debounced version specifically for impressions to avoid rapid-fire during scrolling
    const trackImpression = useCallback(
        debounce((modelType, modelId) => {
            fireEvent('impression', modelType, modelId);
        }, 1000), // Only fire if user stays on it for 1s
        [fireEvent]
    );

    return { fireEvent, trackImpression };
};
