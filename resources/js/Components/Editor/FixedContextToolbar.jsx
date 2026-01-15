import React, { useState, useEffect, useRef } from 'react';
import {
    ChevronDown, Minus, Plus, Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered,
    Palette, Type, PaintRoller, X, Lock, LockKeyhole, Layers, ArrowUp, ArrowDown,
    ArrowUpFromLine, ArrowDownToLine, AlignVerticalSpaceAround, AlignHorizontalSpaceAround,
    Search, Check, GripVertical, Image as ImageIcon, Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TextEffectsPanel from './TextEffectsPanel';

const FONT_FAMILIES = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
    'Playfair Display', 'Merriweather', 'Nunito', 'Oswald',
    'Raleway', 'Poppins', 'Quicksand', 'Ubuntu', 'PT Sans'
];

const FONT_CATEGORIES = ['Handwriting', 'Corporate', 'Display', 'Headings', 'Paragraph', 'Sans-serif', 'Serif'];

export default function FixedContextToolbar({
    selection, selectedIds, pages, onSelect, onStyleChange,
    onAlign, onLayerAction, forceClose, showEffects, setShowEffects
}) {
    const elements = pages.flatMap(p => p.elements);
    const [activePanel, setActivePanel] = useState(null); // 'position' | 'font' | null
    const [fontSearch, setFontSearch] = useState('');
    const [showTransparency, setShowTransparency] = useState(false);
    const [showSpacing, setShowSpacing] = useState(false);

    useEffect(() => {
        if (forceClose > 0) {
            setActivePanel(null);
            setShowTransparency(false);
            setShowSpacing(false);
        }
    }, [forceClose]);

    // Close popovers on selection change (but not the effects panel)
    const prevSelectedIdsRef = useRef(selectedIds);
    useEffect(() => {
        const prevIds = prevSelectedIdsRef.current;
        const hasChanged = prevIds.length !== selectedIds.length ||
            !prevIds.every((id, index) => id === selectedIds[index]);

        if (hasChanged) {
            setShowTransparency(false);
            setShowSpacing(false);
            prevSelectedIdsRef.current = selectedIds;
        }
    }, [selectedIds]);

    if (!selection || selectedIds.length === 0) return null;

    const handleStyleChange = (key, value) => {
        onStyleChange(selectedIds, { [key]: value });
    };

    const handleTextTransform = () => {
        const current = selection.textTransform;
        handleStyleChange('textTransform', current === 'uppercase' ? 'none' : 'uppercase');
    };

    const handleList = (type) => {
        const current = selection.listType;
        handleStyleChange('listType', current === type ? 'none' : type);
    };

    const handleDimensionChange = (key, value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return;

        if (key === 'width') {
            const scaleX = selection.scaleX || 1;
            handleStyleChange('width', num / scaleX);
        } else if (key === 'height') {
            const scaleY = selection.scaleY || 1;
            handleStyleChange('height', num / scaleY);
        } else {
            handleStyleChange(key, num);
        }
    };

    const togglePanel = (panel) => {
        setActivePanel(activePanel === panel ? null : panel);
    };

    const elementType = selection.type;
    const isText = elementType === 'text';

    if (!isText) return null;

    return (
        <>
            {/* Fixed Floating Toolbar */}
            <div className="fixed top-[60px] left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center py-1.5 px-2">
                <div className="flex items-center gap-1.5">
                    {/* Font Family Button */}
                    <button
                        onClick={() => togglePanel('font')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-300 min-w-[140px] justify-between bg-transparent ${activePanel === 'font' ? 'bg-gray-100 border-purple-500' : ''}`}
                    >
                        <span className="font-medium truncate max-w-[100px]">{selection.fontFamily || 'Inter'}</span>
                        <ChevronDown size={14} className="text-gray-500 shrink-0" />
                    </button>

                    <div className="w-px h-5 bg-gray-300 mx-1" />

                    {/* Font Size Controls */}
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                        <button
                            onClick={() => handleStyleChange('fontSize', Math.max(8, (selection.fontSize || 20) - 1))}
                            className="px-2 py-1.5 hover:bg-gray-100 border-r border-gray-300 bg-transparent"
                        >
                            <Minus size={14} className="text-gray-700" />
                        </button>
                        <input
                            type="number"
                            value={selection.fontSize || 20}
                            onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value) || 20)}
                            className="w-10 text-center text-sm text-gray-700 border-none focus:outline-none focus:ring-0 py-1 bg-transparent px-0"
                        />
                        <button
                            onClick={() => handleStyleChange('fontSize', (selection.fontSize || 20) + 1)}
                            className="px-2 py-1.5 hover:bg-gray-100 border-l border-gray-300 bg-transparent"
                        >
                            <Plus size={14} className="text-gray-700" />
                        </button>
                    </div>

                    {/* Text Color */}
                    <div className="relative group ml-1">
                        <button className="flex flex-col items-center justify-center w-8 h-8 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200">
                            <span className="text-base font-bold text-gray-700">A</span>
                            <div
                                className="w-4 h-0.5 mt-0.5 rounded-full"
                                style={{ backgroundColor: selection.fill || '#000000' }}
                            />
                        </button>
                        <input
                            type="color"
                            value={selection.fill || '#000000'}
                            onChange={(e) => handleStyleChange('fill', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>

                    {/* Text Formatting */}
                    <ToolbarButton
                        icon={<Bold size={16} />}
                        active={selection.fontWeight === 'bold'}
                        onClick={() => handleStyleChange('fontWeight', selection.fontWeight === 'bold' ? 'normal' : 'bold')}
                    />
                    <ToolbarButton
                        icon={<Italic size={16} />}
                        active={selection.fontStyle === 'italic'}
                        onClick={() => handleStyleChange('fontStyle', selection.fontStyle === 'italic' ? 'normal' : 'italic')}
                    />
                    <ToolbarButton
                        icon={<Underline size={16} />}
                        active={selection.textDecoration === 'underline'}
                        onClick={() => handleStyleChange('textDecoration', selection.textDecoration === 'underline' ? 'none' : 'underline')}
                    />
                    <ToolbarButton
                        icon={<Strikethrough size={16} />}
                        active={selection.textDecoration === 'line-through'}
                        onClick={() => handleStyleChange('textDecoration', selection.textDecoration === 'line-through' ? 'none' : 'line-through')}
                    />

                    {/* Text Case AA */}
                    <ToolbarButton
                        icon={<span className="text-xs font-bold">aA</span>}
                        active={selection.textTransform === 'uppercase'}
                        onClick={handleTextTransform}
                    />

                    <div className="w-px h-5 bg-gray-300 mx-1" />

                    {/* Alignment */}
                    <div className="flex bg-gray-50 rounded border border-gray-200 p-0.5">
                        <ToolbarIcon
                            icon={<AlignLeft size={16} />}
                            active={selection.align === 'left'}
                            onClick={() => handleStyleChange('align', 'left')}
                        />
                        <ToolbarIcon
                            icon={<AlignCenter size={16} />}
                            active={selection.align === 'center'}
                            onClick={() => handleStyleChange('align', 'center')}
                        />
                        <ToolbarIcon
                            icon={<AlignRight size={16} />}
                            active={selection.align === 'right'}
                            onClick={() => handleStyleChange('align', 'right')}
                        />
                        <ToolbarIcon
                            icon={<AlignJustify size={16} />}
                            active={selection.align === 'justify'}
                            onClick={() => handleStyleChange('align', 'justify')}
                        />
                    </div>

                    <ToolbarButton
                        icon={<List size={16} />}
                        active={selection.listType === 'bullet'}
                        onClick={() => handleList('bullet')}
                    />

                    {/* Transparency */}
                    <div className="relative">
                        <ToolbarButton
                            icon={
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect width="16" height="16" fill="white" />
                                    <rect width="4" height="4" fill="#D1D5DB" />
                                    <rect x="8" width="4" height="4" fill="#D1D5DB" />
                                    <rect x="4" y="4" width="4" height="4" fill="#D1D5DB" />
                                    <rect x="12" y="4" width="4" height="4" fill="#D1D5DB" />
                                    <rect y="8" width="4" height="4" fill="#D1D5DB" />
                                    <rect x="8" y="8" width="4" height="4" fill="#D1D5DB" />
                                    <rect x="4" y="12" width="4" height="4" fill="#D1D5DB" />
                                    <rect x="12" y="12" width="4" height="4" fill="#D1D5DB" />
                                </svg>
                            }
                            onClick={() => {
                                setShowTransparency(!showTransparency);
                                if (!showTransparency) setShowSpacing(false);
                            }}
                            active={showTransparency}
                            tooltip="Transparency"
                        />
                        {showTransparency && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-48" style={{ zIndex: 2 }}>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-gray-500">Opacity</span>
                                    <span className="text-xs font-bold text-gray-900 w-8">{Math.round((selection.opacity ?? 1) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={selection.opacity ?? 1}
                                    onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value))}
                                    className="w-full mt-2 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                            </div>
                        )}
                    </div>

                    {/* Spacing (Letter & Line) */}
                    <div className="relative">
                        <ToolbarButton
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 5h2M11 19h2M11 12h2" />
                                    <path d="M5 12h14" strokeWidth="1.5" />
                                    <path d="M9 8l-2 4 2 4M15 8l2 4-2 4" />
                                </svg>
                            }
                            onClick={() => {
                                setShowSpacing(!showSpacing);
                                if (!showSpacing) setShowTransparency(false);
                            }}
                            active={showSpacing}
                            tooltip="Spacing"
                        />
                        {showSpacing && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-72" style={{ zIndex: 2 }}>
                                {/* Letter Spacing */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-700">Letter spacing</span>
                                        <span className="text-xs font-bold text-gray-900 w-12 text-right">{Math.round(selection.letterSpacing || 0)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-43"
                                        max="200"
                                        step="1"
                                        value={selection.letterSpacing || 0}
                                        onChange={(e) => handleStyleChange('letterSpacing', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>

                                {/* Line Spacing */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-700">Line spacing</span>
                                        <span className="text-xs font-bold text-gray-900 w-12 text-right">{(selection.lineHeight || 1).toFixed(1)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3"
                                        step="0.1"
                                        value={selection.lineHeight || 1}
                                        onChange={(e) => handleStyleChange('lineHeight', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>

                            </div>
                        )}
                    </div>

                    <div className="w-px h-5 bg-gray-300 mx-1" />

                    <button
                        onClick={() => setShowEffects(!showEffects)}
                        className={`px-3 py-1.5 text-sm font-medium rounded ${showEffects ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        Effects
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                        Animate
                    </button>
                    <button
                        onClick={() => togglePanel('position')}
                        className={`px-3 py-1.5 text-sm font-medium rounded ${activePanel === 'position' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        Position
                    </button>
                    <button className="p-1.5 text-gray-700 hover:bg-gray-100 rounded">
                        <PaintRoller size={16} />
                    </button>
                </div>
            </div>

            {/* Side Panel Overlay: Position & Font */}
            <AnimatePresence mode="wait">
                {activePanel && (
                    <motion.div
                        key={activePanel}
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed top-[64px] left-[72px] bottom-4 w-[320px] bg-white rounded-xl border border-gray-200 shadow-2xl z-[40] overflow-hidden"
                    >
                        {activePanel === 'position' ? (
                            <PositionPanelContent
                                onClose={() => setActivePanel(null)}
                                onAlign={onAlign}
                                onLayerAction={onLayerAction}
                                selection={selection}
                                selectedIds={selectedIds}
                                elements={elements}
                                onSelect={onSelect}
                                handleDimensionChange={handleDimensionChange}
                            />
                        ) : activePanel === 'font' ? (
                            <FontPanelContent
                                onClose={() => setActivePanel(null)}
                                selection={selection}
                                fontSearch={fontSearch}
                                setFontSearch={setFontSearch}
                                onFontSelect={(font) => handleStyleChange('fontFamily', font)}
                            />
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function FontPanelContent({ onClose, selection, fontSearch, setFontSearch, onFontSelect }) {
    const filteredFonts = FONT_FAMILIES.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Font</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-4">
                <button className="flex-1 py-3 text-sm font-medium text-purple-600 border-b-2 border-purple-600">Font</button>
                <button className="flex-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-800">Text styles</button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 flex flex-col gap-4">
                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder='Try "Calligraphy" or "Open Sans"'
                        className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-transparent focus:outline-none focus:border-purple-600 transition-colors"
                        value={fontSearch}
                        onChange={(e) => setFontSearch(e.target.value)}
                    />
                    {/* Filter icon placeholder */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M4 21v-7" /><path d="M4 10V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" /><path d="M1 14h6" /><path d="M9 8h6" /><path d="M17 16h6" /></svg>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {FONT_CATEGORIES.map(cat => (
                        <button key={cat} className="px-3 py-1.5 rounded-full border border-gray-300 text-xs font-medium text-gray-700 whitespace-nowrap hover:bg-gray-50 transition-colors bg-transparent">
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Font List */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                        Document fonts
                    </div>
                    <div className="space-y-1">
                        <FontItem font={selection.fontFamily || 'Inter'} selected={true} onClick={() => { }} />
                    </div>

                    <div className="h-px bg-gray-100 my-2" />

                    <div className="text-sm font-medium text-gray-900">All fonts</div>
                    <div className="space-y-1">
                        {filteredFonts.map(font => (
                            <FontItem
                                key={font}
                                font={font}
                                selected={selection.fontFamily === font}
                                onClick={() => onFontSelect(font)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 shadow-sm transition-colors">
                    <span className="text-lg leading-none">+</span> Upload a font
                </button>
            </div>
        </div>
    );
}

function FontItem({ font, selected, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors group ${selected ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
        >
            <div className="flex items-center gap-2 overflow-hidden">
                {!selected && <ChevronDown size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transform -rotate-90 transition-all" />}
                {selected && <ChevronDown size={12} className="text-purple-600 transform -rotate-90" />}
                <span className="text-base truncate font-medium text-black" style={{ fontFamily: font }}>{font}</span>
            </div>
            {selected && <Check size={16} className="text-purple-600 shrink-0" />}
        </button>
    )
}

function PositionPanelContent({ onClose, onAlign, onLayerAction, selection, selectedIds, elements, onSelect, handleDimensionChange }) {
    const [activeTab, setActiveTab] = useState('arrange'); // 'arrange' | 'layers'
    const [layerFilter, setLayerFilter] = useState('all'); // 'all' | 'overlapping'
    const [draggedId, setDraggedId] = useState(null);

    const handleDragStart = (e, id) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
        // Create an invisible ghost image to avoid standard drag behavior if needed, 
        // but default is fine for a list.
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (draggedId === targetId) return;

        const fromIndex = elements.findIndex(el => el.id === draggedId);
        const toIndex = elements.findIndex(el => el.id === targetId);

        if (fromIndex !== -1 && toIndex !== -1) {
            onLayerAction('reorder', { id: draggedId, targetIndex: toIndex });
        }
        setDraggedId(null);
    };

    // Filter elements (reverse for top-down display)
    const reversedElements = [...elements].reverse();

    // Simple overlapping logic: elements that share any X/Y space? 
    // Or just all for now to keep it responsive. 
    // Canva's 'overlapping' usually shows elements near the selection.
    const filteredElements = layerFilter === 'overlapping' && selection
        ? reversedElements.filter(el => {
            if (el.id === selection.id) return true;
            const s = selection;
            const margin = 20;
            return !(el.x > s.x + s.width + margin ||
                el.x + el.width < s.x - margin ||
                el.y > s.y + s.height + margin ||
                el.y + el.height < s.y - margin);
        })
        : reversedElements;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Position</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-4">
                <button
                    onClick={() => setActiveTab('arrange')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'arrange' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Arrange
                </button>
                <button
                    onClick={() => setActiveTab('layers')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'layers' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Layers
                </button>
            </div>

            {/* Scrollalbe Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {activeTab === 'arrange' ? (
                    <div className="p-4 space-y-6">
                        {/* Layer Order */}
                        <div>
                            <div className="grid grid-cols-2 gap-2">
                                <PositionActionButton
                                    icon={<ArrowUpFromLine size={16} />}
                                    label="Forward"
                                    onClick={() => onLayerAction('forward')}
                                />
                                <PositionActionButton
                                    icon={<ArrowDownToLine size={16} />}
                                    label="Backward"
                                    onClick={() => onLayerAction('backward')}
                                />
                                <PositionActionButton
                                    icon={<ArrowUp size={16} />}
                                    label="To front"
                                    onClick={() => onLayerAction('front')}
                                />
                                <PositionActionButton
                                    icon={<ArrowDown size={16} />}
                                    label="To back"
                                    onClick={() => onLayerAction('back')}
                                />
                            </div>
                        </div>

                        {/* Align to page */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 mb-3">Align to page</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <PositionActionButton icon={<ArrowUpToLineRotated size={16} />} label="Top" onClick={() => onAlign('top')} />
                                <PositionActionButton icon={<ArrowLeftToLine size={16} />} label="Left" onClick={() => onAlign('left')} />
                                <PositionActionButton icon={<AlignVerticalSpaceAround size={16} />} label="Middle" onClick={() => onAlign('middle')} />
                                <PositionActionButton icon={<AlignHorizontalSpaceAround size={16} />} label="Center" onClick={() => onAlign('center')} />
                                <PositionActionButton icon={<ArrowDownToLineRotated size={16} />} label="Bottom" onClick={() => onAlign('bottom')} />
                                <PositionActionButton icon={<ArrowRightToLine size={16} />} label="Right" onClick={() => onAlign('right')} />
                            </div>
                        </div>

                        {/* Advanced Dimensions */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-900 mb-3">Advanced</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                <DimensionInput
                                    label="Width"
                                    value={selection.width * (selection.scaleX || 1)}
                                    onChange={(val) => handleDimensionChange('width', val)}
                                />
                                <div className="flex items-end gap-2">
                                    <DimensionInput
                                        label="Height"
                                        value={selection.height * (selection.scaleY || 1)}
                                        onChange={(val) => handleDimensionChange('height', val)}
                                        className="flex-1"
                                    />
                                    <button className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 mb-[1px]">
                                        <LockKeyhole size={16} className="text-gray-600" />
                                    </button>
                                </div>
                                <DimensionInput
                                    label="X"
                                    value={selection.x}
                                    onChange={(val) => handleDimensionChange('x', val)}
                                />
                                <div className="flex items-end gap-2">
                                    <DimensionInput
                                        label="Y"
                                        value={selection.y}
                                        onChange={(val) => handleDimensionChange('y', val)}
                                        className="flex-1"
                                    />
                                    <DimensionInput
                                        label="Rotate"
                                        value={selection.rotation || 0}
                                        onChange={(val) => handleDimensionChange('rotation', val)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full pb-4">
                        {/* Filters */}
                        <div className="flex gap-2 p-4 pt-2">
                            <button
                                onClick={() => setLayerFilter('all')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-colors ${layerFilter === 'all' ? 'bg-purple-100 border-purple-200 text-purple-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>All</button>
                            <button
                                onClick={() => setLayerFilter('overlapping')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-colors ${layerFilter === 'overlapping' ? 'bg-purple-100 border-purple-200 text-purple-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>Overlapping</button>
                        </div>

                        {/* Layer List */}
                        <div className="flex flex-col">
                            {filteredElements.map((el) => (
                                <LayerItem
                                    key={el.id}
                                    element={el}
                                    isSelected={selectedIds.includes(el.id)}
                                    onSelect={() => onSelect([el.id])}
                                    onDragStart={(e) => handleDragStart(e, el.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, el.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function LayerItem({ element, isSelected, onSelect, onDragStart, onDragOver, onDrop }) {
    const Icon = element.type === 'text' ? Type : (element.type === 'image' ? ImageIcon : Square);

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer group border-b border-gray-50 transition-colors ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
        >
            <GripVertical size={16} className="text-gray-300 group-hover:text-gray-400 shrink-0" />
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                {element.type === 'image' && element.src ? (
                    <img src={element.src} className="w-full h-full object-cover" />
                ) : (
                    <Icon size={18} className="text-gray-600" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                    {element.type === 'text' ? (element.text || 'Text') : (element.type.charAt(0).toUpperCase() + element.type.slice(1))}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{element.type}</p>
            </div>
        </div>
    )
}

function ToolbarButton({ icon, onClick, active, tooltip }) {
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${active
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
        >
            {icon}
        </button>
    );
}

function ToolbarIcon({ icon, onClick, active }) {
    return (
        <button
            onClick={onClick}
            className={`w-7 h-7 flex items-center justify-center rounded-sm transition-colors ${active
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
        >
            {icon}
        </button>
    );
}

function PositionActionButton({ icon, label, onClick }) {
    return (
        <button onClick={onClick} className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-left group">
            <span className="text-gray-500 group-hover:text-gray-900">{icon}</span>
            <span className="text-sm text-gray-700 font-medium">{label}</span>
        </button>
    )
}

function DimensionInput({ label, value, onChange, className = '' }) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        const num = parseFloat(value);
        setLocalValue(isNaN(num) ? 0 : Math.round(num * 10) / 10);
    }, [value]);

    const submit = () => {
        if (onChange) onChange(localValue);
    };

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label className="text-[11px] font-medium text-gray-500">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={submit}
                    onKeyDown={(e) => e.key === 'Enter' && (submit(), e.target.blur())}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:border-purple-600"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-400 pointer-events-none select-none">
                    {label === 'Rotate' ? '°' : 'px'}
                </span>
            </div>
        </div>
    )
}

// Custom Icons for alignment visualization
const ArrowUpToLineRotated = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16" /><path d="M12 21V6" /><path d="m8 10 4-4 4 4" /></svg>
);
const ArrowDownToLineRotated = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18h16" /><path d="M12 3v15" /><path d="m8 14 4 4 4-4" /></svg>
);
const ArrowLeftToLine = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v16" /><path d="M21 12H6" /><path d="m10 8-4 4 4 4" /></svg>
);
const ArrowRightToLine = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 4v16" /><path d="M3 12h15" /><path d="m14 8 4 4-4 4" /></svg>
);
