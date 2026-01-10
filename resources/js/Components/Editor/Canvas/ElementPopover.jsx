import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Wand2, Copy, Trash2, Lock, Layers, AlignCenter, Link2, MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

export default function ElementPopover({
    position,
    selection,
    onDelete,
    onDuplicate,
    onLockToggle,
    isMultiSelect = false,
    onAlign,
    onLayerAction,
    isScrolling = false
}) {
    const [showMenu, setShowMenu] = useState(false);

    if (!position || !selection || isScrolling) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y - 12, // Small gap from the top edge
                zIndex: 1,
                transform: 'translate(-50%, -100%)', // Anchor bottom-center to the position
            }}
            className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 px-1.5 py-1.5 select-none"
        >
            {/* Ask Canva / Magic */}
            <PopoverButton
                icon={<Sparkles size={16} className="text-blue-600" />}
                label="Ask Canva"
                onClick={() => toast.info('AI Magic features coming soon!', {
                    description: 'We are working hard to bring AI-powered design to you.'
                })}
                className="text-blue-600"
            />

            {/* Magic Wand */}
            <PopoverButton
                icon={<Wand2 size={16} />}
                onClick={() => { }}
            />

            {/* Copy style */}
            <PopoverButton
                icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 2.5V8.5H12V2.5H4Z" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M6 8.5V13.5" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                }
                onClick={() => { }}
                tooltip="Copy style"
            />

            {/* Lock toggle */}
            <PopoverButton
                icon={selection.locked ? <Lock size={16} className="text-purple-600" /> : <Lock size={16} />}
                onClick={onLockToggle}
                tooltip={selection.locked ? "Unlock" : "Lock"}
            />

            {/* Duplicate */}
            <PopoverButton
                icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M6 6H13V13H6V6Z" stroke="currentColor" strokeWidth="1.2" fill="white" />
                        <path d="M9.5 8V11" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M8 9.5H11" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                }
                onClick={onDuplicate}
                tooltip="Duplicate"
            />

            {/* Delete */}
            <PopoverButton
                icon={<Trash2 size={16} />}
                onClick={onDelete}
                tooltip="Delete"
            />

            {/* More Options Button */}
            <div className="relative">
                <PopoverButton
                    icon={<MoreHorizontal size={16} />}
                    onClick={() => setShowMenu(!showMenu)}
                    active={showMenu}
                    tooltip="More"
                />

                {/* Dropdown Menu (Anchored to Right of Toolbar) */}
                <AnimatePresence>
                    {showMenu && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[220px] select-none z-[10001]"
                        >
                            <MenuItem
                                icon={<Copy size={16} />}
                                label="Copy"
                                shortcut="Ctrl+C"
                                onClick={() => { }}
                            />
                            <MenuItem
                                icon={
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M4 2.5V8.5H12V2.5H4Z" stroke="currentColor" strokeWidth="1.2" />
                                        <path d="M6 8.5V13.5" stroke="currentColor" strokeWidth="1.2" />
                                    </svg>
                                }
                                label="Copy style"
                                shortcut="Ctrl+Alt+C"
                                onClick={() => { }}
                            />
                            <MenuItem
                                label="Paste"
                                shortcut="Ctrl+V"
                                onClick={() => { }}
                            />
                            <MenuItem
                                icon={
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.2" />
                                        <path d="M6 6H13V13H6V6Z" stroke="currentColor" strokeWidth="1.2" fill="white" />
                                    </svg>
                                }
                                label="Duplicate"
                                shortcut="Ctrl+D"
                                onClick={onDuplicate}
                            />
                            <div className="h-px bg-gray-200 my-1" />
                            <MenuItem
                                icon={<Trash2 size={16} />}
                                label="Delete"
                                shortcut="DELETE"
                                onClick={onDelete}
                            />
                            <div className="h-px bg-gray-200 my-1" />
                            <MenuItem
                                icon={<Lock size={16} />}
                                label="Lock"
                                shortcut="Alt+Shift+L"
                                onClick={onLockToggle}
                            />

                            {/* Layer Submenu */}
                            <div className="relative group">
                                <MenuItem
                                    icon={<Layers size={16} />}
                                    label="Layer"
                                    hasSubmenu
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                />
                                {/* Submenu */}
                                <div className="hidden group-hover:block absolute right-full top-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px] mr-1">
                                    <MenuItem label="Bring forward" shortcut="Ctrl+]" onClick={() => onLayerAction && onLayerAction('forward')} />
                                    <MenuItem label="Bring to front" shortcut="Ctrl+Alt+]" onClick={() => onLayerAction && onLayerAction('front')} />
                                    <MenuItem label="Send backward" shortcut="Ctrl+[" onClick={() => onLayerAction && onLayerAction('backward')} />
                                    <MenuItem label="Send to back" shortcut="Ctrl+Alt+[" onClick={() => onLayerAction && onLayerAction('back')} />
                                    <div className="h-px bg-gray-200 my-1" />
                                    <MenuItem label="Show layers" onClick={() => { }} />
                                </div>
                            </div>

                            {/* Align Submenu */}
                            <div className="relative group">
                                <MenuItem
                                    icon={<AlignCenter size={16} />}
                                    label="Align to page"
                                    hasSubmenu
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                />
                                {/* Submenu */}
                                <div className="hidden group-hover:block absolute right-full top-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px] mr-1">
                                    <MenuItem label="Top" onClick={() => onAlign && onAlign('top')} />
                                    <MenuItem label="Left" onClick={() => onAlign && onAlign('left')} />
                                    <MenuItem label="Middle" onClick={() => onAlign && onAlign('middle')} />
                                    <MenuItem label="Center" onClick={() => onAlign && onAlign('center')} />
                                    <MenuItem label="Bottom" onClick={() => onAlign && onAlign('bottom')} />
                                    <MenuItem label="Right" onClick={() => onAlign && onAlign('right')} />
                                </div>
                            </div>

                            <div className="h-px bg-gray-200 my-1" />
                            <MenuItem
                                icon={<Link2 size={16} />}
                                label="Link"
                                shortcut="Ctrl+K"
                                onClick={() => { }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function PopoverButton({ icon, label, onClick, active, className = '', tooltip }) {
    return (
        <button
            onClick={onClick}
            title={tooltip || label}
            className={`p-2 rounded transition-colors text-gray-700 ${active ? 'bg-gray-100 text-purple-600' : 'hover:bg-gray-100'} ${className}`}
        >
            {icon}
        </button>
    );
}

function MenuItem({ icon, label, shortcut, hasSubmenu, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 text-left text-sm text-gray-700"
        >
            <div className="flex items-center gap-3">
                {icon && <span className="text-gray-600">{icon}</span>}
                <span>{label}</span>
            </div>
            {shortcut && (
                <span className="text-xs text-gray-500">{shortcut}</span>
            )}
            {hasSubmenu && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </button>
    );
}
