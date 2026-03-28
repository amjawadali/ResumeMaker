import React, { useEffect, useRef } from 'react';
import { Copy, Scissors, Files, Trash2, Lock, Unlock, Layers, MoveUp, MoveDown, Group as GroupIcon, Ungroup } from 'lucide-react';

/**
 * Professional Context Menu Component
 * Replaces browser default right-click menu with custom options
 */
export default function ContextMenu({ position, onClose, selection, onCopy, onCut, onPaste, onDuplicate, onDelete, onLock, onLayerAction, onGroup, onUngroup, canPaste }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    if (!position) return null;

    const menuItems = [];

    // Selection-specific actions
    if (selection) {
        menuItems.push(
            { icon: Copy, label: 'Copy', shortcut: 'Ctrl+C', action: onCopy },
            { icon: Scissors, label: 'Cut', shortcut: 'Ctrl+X', action: onCut },
            { icon: Files, label: 'Duplicate', shortcut: 'Ctrl+D', action: onDuplicate },
            { divider: true },
            { icon: selection.locked ? Unlock : Lock, label: selection.locked ? 'Unlock' : 'Lock', action: onLock },
            { divider: true },
            { icon: MoveUp, label: 'Bring to Front', action: () => onLayerAction('front') },
            { icon: MoveDown, label: 'Send to Back', action: () => onLayerAction('back') },
            { divider: true },
            { icon: Trash2, label: 'Delete', shortcut: 'Del', action: onDelete, danger: true }
        );
    }

    // Always show paste if available
    if (canPaste) {
        menuItems.unshift(
            { icon: Files, label: 'Paste', shortcut: 'Ctrl+V', action: onPaste },
            { divider: true }
        );
    }

    // Adjust position to keep menu in viewport
    const adjustedPosition = { ...position };
    if (menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect();
        if (position.x + rect.width > window.innerWidth) {
            adjustedPosition.x = window.innerWidth - rect.width - 10;
        }
        if (position.y + rect.height > window.innerHeight) {
            adjustedPosition.y = window.innerHeight - rect.height - 10;
        }
    }

    return (
        <div
            ref={menuRef}
            className="fixed bg-white rounded-lg shadow-2xl border border-slate-200 py-1 z-[9999] min-w-[200px] select-none"
            style={{
                left: `${adjustedPosition.x}px`,
                top: `${adjustedPosition.y}px`
            }}
        >
            {menuItems.map((item, index) => {
                if (item.divider) {
                    return <div key={`divider-${index}`} className="h-px bg-slate-200 my-1" />;
                }

                const Icon = item.icon;
                return (
                    <button
                        key={index}
                        onClick={() => {
                            item.action();
                            onClose();
                        }}
                        className={`w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors text-left ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Icon size={16} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {item.shortcut && (
                            <span className="text-xs text-slate-400 font-mono">{item.shortcut}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
