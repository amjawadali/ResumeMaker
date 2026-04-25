import { useEffect } from 'react';

/**
 * Hook to centralize all editor keyboard shortcuts.
 */
export function useEditorShortcuts(actions, deps = []) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Priority 1: Ignore if typing in an input
            const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;
            if (isInput) return;

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

            // Global Shortcuts
            if (cmdOrCtrl) {
                switch (e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) actions.redo?.();
                        else actions.undo?.();
                        break;
                    case 'y':
                        e.preventDefault();
                        actions.redo?.();
                        break;
                    case 'c':
                        actions.copy?.();
                        break;
                    case 'v':
                        actions.paste?.();
                        break;
                    case 'x':
                        actions.cut?.();
                        break;
                    case 'd':
                        e.preventDefault();
                        actions.duplicate?.();
                        break;
                    case 'g':
                        e.preventDefault();
                        if (e.shiftKey) actions.ungroup?.();
                        else actions.group?.();
                        break;
                    case 's':
                        e.preventDefault();
                        actions.save?.();
                        break;
                    case '0':
                        e.preventDefault();
                        actions.resetZoom?.();
                        break;
                    case '=':
                    case '+':
                        e.preventDefault();
                        actions.zoomIn?.();
                        break;
                    case '-':
                    case '_':
                        e.preventDefault();
                        actions.zoomOut?.();
                        break;
                    default:
                        break;
                }
            } else {
                // Secondary Shortcuts (no modifier)
                switch (e.key) {
                    case 'Delete':
                    case 'Backspace':
                        actions.delete?.();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        actions.nudge?.(e.shiftKey ? -10 : -1, 0);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        actions.nudge?.(e.shiftKey ? 10 : 1, 0);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        actions.nudge?.(0, e.shiftKey ? -10 : -1);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        actions.nudge?.(0, e.shiftKey ? 10 : 1);
                        break;
                    case 'Enter':
                        if (actions.activeSelection?.type === 'text' && !e.shiftKey) {
                            e.preventDefault();
                            actions.startEditing?.(actions.activeSelection.id);
                        }
                        break;
                    default:
                        break;
                }
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                actions.setHandMode?.(false);
            }
        };

        const handleKeyDownHandMode = (e) => {
            if (e.code === 'Space' && !e.repeat) {
                // Only if not in input
                if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !e.target.isContentEditable) {
                    e.preventDefault();
                    actions.setHandMode?.(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keydown', handleKeyDownHandMode);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keydown', handleKeyDownHandMode);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [...deps]); // Re-register if actions or deps change
}
