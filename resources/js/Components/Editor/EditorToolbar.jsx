import React, { useState } from 'react';
import {
    ChevronDown, Minus, Plus, Bold, Italic, Underline,
    AlignLeft, List, MoreHorizontal, Layers, Layout,
    AlignCenter, AlignRight, AlignStartVertical, AlignEndVertical,
    MoveUp, MoveDown, Maximize2, Palette, Sparkles, Box,
    Type, Strikethrough, Baseline, Languages, Grid3X3,
    Paintbrush, Lock, Unlock
} from 'lucide-react';

export default function EditorToolbar({ selection, onStyleChange, onLayerAction, onAlign, onLockToggle, onFormatPainter }) {
    if (!selection) return null;

    const [showPosition, setShowPosition] = useState(false);
    const [showEffects, setShowEffects] = useState(false);
    const [showSpacing, setShowSpacing] = useState(false);
    const [showTransparency, setShowTransparency] = useState(false);

    const handleStyleChange = (key, value) => {
        onStyleChange(selection.id, { [key]: value });
    };

    const currentFont = selection.fontFamily || 'Inter';
    const currentSize = selection.fontSize || 20;

    const [showFonts, setShowFonts] = useState(false);

    const fonts = [
        'Inter', 'Roboto', 'Playfair Display', 'Montserrat',
        'Open Sans', 'Lato', 'Poppins', 'Merriweather'
    ];

    return (
        <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-1 select-none shrink-0 z-50 relative shadow-sm overflow-x-auto scrollbar-hide">
            {/* Font Control */}
            {selection.type === 'text' && (
                <>
                    <div className="relative">
                        <button
                            onClick={() => setShowFonts(!showFonts)}
                            className="flex items-center justify-between min-w-[120px] px-2 py-1.5 hover:bg-slate-100 rounded border border-slate-200 transition-all text-xs font-bold text-slate-700 truncate"
                        >
                            <span className="truncate">{currentFont}</span>
                            <ChevronDown size={14} className="ml-1 text-slate-400" />
                        </button>
                        {showFonts && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-[70] max-h-64 overflow-y-auto">
                                {fonts.map(font => (
                                    <button
                                        key={font}
                                        onClick={() => { handleStyleChange('fontFamily', font); setShowFonts(false); }}
                                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${currentFont === font ? 'bg-slate-50 text-[#7D2AE8] font-bold' : 'text-slate-700'}`}
                                        style={{ fontFamily: font }}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-0.5 border border-slate-200 rounded px-1 ml-1 overflow-hidden">
                        <button onClick={() => handleStyleChange('fontSize', Math.max(1, currentSize - 1))} className="p-1 hover:bg-slate-100 text-slate-600"><Minus size={14} /></button>
                        <input
                            type="number" value={currentSize}
                            onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                            className="w-10 text-center text-xs font-bold border-none p-0 focus:ring-0"
                        />
                        <button onClick={() => handleStyleChange('fontSize', currentSize + 1)} className="p-1 hover:bg-slate-100 text-slate-600"><Plus size={14} /></button>
                    </div>
                </>
            )}

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            {/* Color & Basic Styling */}
            <div className="relative group p-1.5 hover:bg-slate-100 rounded cursor-pointer transition-colors">
                <input
                    type="color"
                    value={selection.fill || '#000000'}
                    onChange={(e) => handleStyleChange('fill', e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                    <span className="text-xs font-black h-4 flex items-center">A</span>
                    <div className="h-1 w-5 rounded-full" style={{ backgroundColor: selection.fill || '#000' }}></div>
                </div>
            </div>

            {selection.type === 'text' && (
                <>
                    <ToolbarButton icon={<Bold size={18} />} active={selection.fontWeight === 'bold'} onClick={() => handleStyleChange('fontWeight', selection.fontWeight === 'bold' ? 'normal' : 'bold')} />
                    <ToolbarButton icon={<Italic size={18} />} active={selection.fontStyle === 'italic'} onClick={() => handleStyleChange('fontStyle', selection.fontStyle === 'italic' ? 'normal' : 'italic')} />
                    <ToolbarButton icon={<Underline size={18} />} active={selection.textDecoration?.includes('underline')} onClick={() => handleStyleChange('textDecoration', selection.textDecoration?.includes('underline') ? '' : 'underline')} />
                </>
            )}

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            {/* Alignment & Spacing */}
            <ToolbarButton icon={<AlignLeft size={18} />} onClick={() => { }} />

            {selection.type === 'text' && (
                <div className="relative">
                    <ToolbarButton
                        icon={<List size={18} className="rotate-90" />}
                        onClick={() => setShowSpacing(!showSpacing)}
                        active={showSpacing}
                    />
                    {showSpacing && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-[60]">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Letter Spacing</label>
                            <input
                                type="range" min="-10" max="50" value={selection.letterSpacing || 0}
                                onChange={(e) => handleStyleChange('letterSpacing', parseInt(e.target.value))}
                                className="w-full accent-[#7D2AE8] h-1 mb-3"
                            />
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Line Spacing</label>
                            <input
                                type="range" min="0.5" max="3" step="0.1" value={selection.lineHeight || 1.2}
                                onChange={(e) => handleStyleChange('lineHeight', parseFloat(e.target.value))}
                                className="w-full accent-[#7D2AE8] h-1"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            {/* Effects */}
            <div className="relative">
                <button
                    onClick={() => { setShowEffects(!showEffects); setShowPosition(false); }}
                    className={`px-3 py-1.5 hover:bg-slate-100 rounded text-xs font-bold transition-colors ${showEffects ? 'bg-slate-50 text-[#7D2AE8]' : 'text-slate-600'}`}
                >
                    Effects
                </button>
                {showEffects && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-[60]">
                        <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Style</h4>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-[10px] font-bold">Corner Radius</span>
                                    <span className="text-[10px] text-slate-400">{selection.cornerRadius || 0}</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" value={selection.cornerRadius || 0}
                                    onChange={(e) => handleStyleChange('cornerRadius', parseInt(e.target.value))}
                                    className="w-full h-1 accent-[#7D2AE8]"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-[10px] font-bold">Shadow Blur</span>
                                    <span className="text-[10px] text-slate-400">{selection.shadowBlur || 0}</span>
                                </div>
                                <input
                                    type="range" min="0" max="50" value={selection.shadowBlur || 0}
                                    onChange={(e) => handleStyleChange('shadowBlur', parseInt(e.target.value))}
                                    className="w-full h-1 accent-[#7D2AE8]"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <button
                    onClick={() => { setShowPosition(!showPosition); setShowEffects(false); }}
                    className={`px-3 py-1.5 hover:bg-slate-100 rounded text-xs font-bold transition-colors ${showPosition ? 'bg-slate-50 text-[#7D2AE8]' : 'text-slate-600'}`}
                >
                    Position
                </button>
                {showPosition && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-[60]">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Align to Page</h4>
                                <div className="grid grid-cols-3 gap-1">
                                    <button onClick={() => onAlign('left')} className="p-2 hover:bg-slate-50 border border-slate-100 rounded" title="Left"><AlignLeft size={16} /></button>
                                    <button onClick={() => onAlign('center-h')} className="p-2 hover:bg-slate-50 border border-slate-100 rounded" title="Center-H"><AlignCenter size={16} /></button>
                                    <button onClick={() => onAlign('right')} className="p-2 hover:bg-slate-50 border border-slate-100 rounded" title="Right"><AlignRight size={16} /></button>
                                    <button onClick={() => onAlign('top')} className="p-2 hover:bg-slate-50 border border-slate-100 rounded rotate-90" title="Top"><AlignStartVertical size={16} /></button>
                                    <button onClick={() => onAlign('center-v')} className="p-2 hover:bg-slate-50 border border-slate-100 rounded rotate-90" title="Center-V"><AlignCenter size={16} /></button>
                                    <button onClick={() => onAlign('bottom')} className="p-2 hover:bg-slate-50 border border-slate-100 rounded rotate-90" title="Bottom"><AlignEndVertical size={16} /></button>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Layers</h4>
                                <div className="space-y-1">
                                    <button onClick={() => onLayerAction('front')} className="w-full p-2 text-left text-[10px] font-bold hover:bg-slate-50 flex items-center justify-between border border-slate-100 rounded uppercase">
                                        Front <MoveUp size={14} className="text-[#7D2AE8]" />
                                    </button>
                                    <button onClick={() => onLayerAction('back')} className="w-full p-2 text-left text-[10px] font-bold hover:bg-slate-50 flex items-center justify-between border border-slate-100 rounded uppercase">
                                        Back <MoveDown size={14} className="text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1"></div>

            {/* Utility Buttons */}
            <div className="relative">
                <ToolbarButton
                    icon={<Grid3X3 size={18} />}
                    onClick={() => setShowTransparency(!showTransparency)}
                    active={showTransparency || (selection.opacity < 1)}
                    tooltip="Transparency"
                />
                {showTransparency && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-[60]">
                        <div className="flex justify-between mb-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Transparency</label>
                            <span className="text-[10px] font-bold text-slate-600">{Math.round((selection.opacity ?? 1) * 100)}</span>
                        </div>
                        <input
                            type="range" min="0" max="1" step="0.01" value={selection.opacity ?? 1}
                            onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value))}
                            className="w-full accent-[#7D2AE8] h-1"
                        />
                    </div>
                )}
            </div>

            <ToolbarButton icon={<Paintbrush size={18} />} onClick={onFormatPainter} tooltip="Copy style" />

            <ToolbarButton
                icon={selection.locked ? <Lock size={18} className="text-[#7D2AE8]" /> : <Unlock size={18} />}
                onClick={onLockToggle}
                active={selection.locked}
                tooltip={selection.locked ? "Unlock" : "Lock"}
            />

            <ToolbarButton icon={<MoreHorizontal size={20} />} onClick={() => { }} />

        </div>
    );
}

function ToolbarButton({ icon, label, onClick, active, tooltip }) {
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className={`p-1.5 rounded transition-all flex items-center gap-1 ${active ? 'bg-[#7D2AE8]/10 text-[#7D2AE8]' : 'hover:bg-slate-100 text-slate-600'}`}
        >
            {icon}
            {label && <span className="text-xs font-bold">{label}</span>}
        </button>
    );
}
