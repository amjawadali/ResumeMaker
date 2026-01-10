import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Type, Image as ImageIcon, Square, Palette, Layers,
    AlignCenter, AlignLeft, AlignRight, Grid3X3, Lock, Unlock,
    ChevronDown, Minus, Plus
} from 'lucide-react';

export default function FloatingToolbar({
    selectedIds = [],
    selection,
    title,
    onTitleChange,
    onStyleChange,
    onAlign,
    onLayerAction,
    onLockToggle,
    onAddElement,
}) {
    const [showTransparency, setShowTransparency] = useState(false);
    const hasSelection = selectedIds.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
            <motion.div
                layout
                className="bg-[#1a1a1a] border border-white/10 rounded-full shadow-2xl px-4 py-2 flex items-center gap-3"
                style={{ backdropFilter: 'blur(10px)' }}
            >
                <AnimatePresence mode="wait">
                    {!hasSelection ? (
                        <DocumentView
                            key="document"
                            title={title}
                            onTitleChange={onTitleChange}
                            onAddElement={onAddElement}
                        />
                    ) : (
                        <ElementView
                            key="element"
                            selection={selection}
                            selectedIds={selectedIds}
                            onStyleChange={onStyleChange}
                            onAlign={onAlign}
                            onLayerAction={onLayerAction}
                            onLockToggle={onLockToggle}
                            showTransparency={showTransparency}
                            setShowTransparency={setShowTransparency}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}

// Document View (No Selection)
function DocumentView({ title, onTitleChange, onAddElement }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3"
        >
            {/* Project Title */}
            <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="bg-transparent border-none text-white text-sm font-semibold focus:outline-none focus:ring-0 w-48"
                placeholder="Untitled Resume"
            />

            <div className="w-px h-6 bg-white/10" />

            {/* Quick Add Buttons */}
            <ToolbarButton
                icon={<Type size={18} />}
                onClick={() => onAddElement('text', { text: 'New Text', fontSize: 20 })}
                tooltip="Add Text"
            />
            <ToolbarButton
                icon={<Square size={18} />}
                onClick={() => onAddElement('rect', { width: 100, height: 100, fill: '#6366f1' })}
                tooltip="Add Shape"
            />
            <ToolbarButton
                icon={<ImageIcon size={18} />}
                onClick={() => { }}
                tooltip="Add Image"
            />

            <div className="w-px h-6 bg-white/10" />

            {/* Background Color */}
            <div className="relative group">
                <input
                    type="color"
                    defaultValue="#ffffff"
                    className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
                />
                <div className="flex items-center gap-1.5 cursor-pointer">
                    <Palette size={18} className="text-white/70" />
                    <span className="text-xs text-white/70">Background</span>
                </div>
            </div>
        </motion.div>
    );
}

// Element View (Selection Active)
function ElementView({
    selection,
    selectedIds,
    onStyleChange,
    onAlign,
    onLayerAction,
    onLockToggle,
    showTransparency,
    setShowTransparency,
}) {
    if (!selection) return null;

    const handleStyleChange = (key, value) => {
        onStyleChange(selectedIds, { [key]: value });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
        >
            {/* Alignment */}
            <ToolbarButton
                icon={<AlignLeft size={18} />}
                onClick={() => onAlign('left')}
                tooltip="Align Left"
            />
            <ToolbarButton
                icon={<AlignCenter size={18} />}
                onClick={() => onAlign('center-h')}
                tooltip="Center"
            />
            <ToolbarButton
                icon={<AlignRight size={18} />}
                onClick={() => onAlign('right')}
                tooltip="Align Right"
            />

            <div className="w-px h-6 bg-white/10" />

            {/* Transparency */}
            <div className="relative">
                <ToolbarButton
                    icon={<Grid3X3 size={18} />}
                    onClick={() => setShowTransparency(!showTransparency)}
                    active={showTransparency || (selection.opacity < 1)}
                    tooltip="Transparency"
                />
                {showTransparency && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl p-3"
                    >
                        <div className="flex justify-between mb-2">
                            <label className="text-[10px] font-bold text-white/70 uppercase">Opacity</label>
                            <span className="text-[10px] font-bold text-white">{Math.round((selection.opacity ?? 1) * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={selection.opacity ?? 1}
                            onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value))}
                            className="w-full accent-purple-500 h-1"
                        />
                    </motion.div>
                )}
            </div>

            <div className="w-px h-6 bg-white/10" />

            {/* Layers */}
            <ToolbarButton
                icon={<Layers size={18} />}
                onClick={() => onLayerAction('front')}
                tooltip="Bring to Front"
            />

            <div className="w-px h-6 bg-white/10" />

            {/* Lock */}
            <ToolbarButton
                icon={selection.locked ? <Lock size={18} /> : <Unlock size={18} />}
                onClick={onLockToggle}
                active={selection.locked}
                tooltip={selection.locked ? "Unlock" : "Lock"}
            />

            {/* Selection Count */}
            {selectedIds.length > 1 && (
                <>
                    <div className="w-px h-6 bg-white/10" />
                    <span className="text-xs text-white/70 font-semibold">
                        {selectedIds.length} selected
                    </span>
                </>
            )}
        </motion.div>
    );
}

function ToolbarButton({ icon, onClick, active, tooltip, className = '' }) {
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className={`p-2 rounded-full transition-all ${active
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                } ${className}`}
        >
            {icon}
        </button>
    );
}
