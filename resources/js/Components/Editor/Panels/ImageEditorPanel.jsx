import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sliders, Sun, Contrast, Droplet, Layers, Image as ImageIcon, Sparkles, Box, Gauge, Palette, RotateCw, FlipHorizontal, Eye, Scissors } from 'lucide-react';
import SemanticTagDropdown from '../SemanticTagDropdown';
import { removeBackground } from '@imgly/background-removal';

const ImageEditorPanel = ({ selection, onClose, onUpdate }) => {
    // Local state for immediate feedback, synced with selection
    const [values, setValues] = useState({
        brightness: selection.brightness || 0,
        contrast: selection.contrast || 0,
        blur: selection.blurRadius || 0,
        saturation: selection.saturation || 0,
        noise: selection.noise || 0,
        pixelate: selection.pixelSize || 1,
        opacity: selection.opacity !== undefined ? selection.opacity : 1,
        cornerRadius: selection.cornerRadius || 0,
        stroke: selection.stroke || null,
        strokeWidth: selection.strokeWidth || 0,
        shadowColor: selection.shadowColor || '#000000',
        shadowBlur: selection.shadowBlur || 0,
        shadowOffsetX: selection.shadowOffsetX || 0,
        shadowOffsetY: selection.shadowOffsetY || 0,
        shadowOpacity: selection.shadowOpacity !== undefined ? selection.shadowOpacity : 0.5,
        sepia: selection.sepia || 0,
        invert: selection.invert || 0,
        grayscale: selection.grayscale || 0,
        tintColor: selection.tintColor || '',
        blendMode: selection.blendMode || 'source-over',
    });

    const [activeTab, setActiveTab] = useState('adjust'); // adjust, filters, style, transform
    const [isRemovingBg, setIsRemovingBg] = useState(false);

    // Update local state when selection changes
    useEffect(() => {
        setValues({
            brightness: selection.brightness || 0,
            contrast: selection.contrast || 0,
            blur: selection.blurRadius || 0,
            saturation: selection.saturation || 0,
            noise: selection.noise || 0,
            pixelate: selection.pixelSize || 1,
            opacity: selection.opacity !== undefined ? selection.opacity : 1,
            cornerRadius: selection.cornerRadius || 0,
            stroke: selection.stroke || '#000000',
            strokeWidth: selection.strokeWidth || 0,
            shadowColor: selection.shadowColor || '#000000',
            shadowBlur: selection.shadowBlur || 0,
            shadowOffsetX: selection.shadowOffsetX || 0,
            shadowOffsetY: selection.shadowOffsetY || 0,
            shadowOpacity: selection.shadowOpacity !== undefined ? selection.shadowOpacity : 0.5,
            sepia: selection.sepia || 0,
            invert: selection.invert || 0,
            grayscale: selection.grayscale || 0,
            tintColor: selection.tintColor || '',
            blendMode: selection.blendMode || 'source-over',
        });
    }, [selection.id, selection.brightness, selection.contrast, selection.blurRadius, selection.saturation, selection.noise, selection.pixelSize, selection.opacity, selection.cornerRadius, selection.stroke, selection.strokeWidth, selection.sepia, selection.invert, selection.grayscale, selection.tintColor, selection.blendMode]);

    const handleChange = (key, value) => {
        setValues(prev => ({ ...prev, [key]: value }));
        onUpdate({ [key]: value });
    };

    const handleRemoveBackground = async () => {
        if (!selection.src || isRemovingBg) return;

        setIsRemovingBg(true);
        try {
            // Remove background using AI with PNG output for transparency
            const blob = await removeBackground(selection.src, {
                output: {
                    format: 'image/png',
                    quality: 1.0,
                }
            });

            // Convert blob to base64 data URL (required for Konva transparency support)
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result;
                // Update the image source with transparent PNG and CLEAR any background fill
                onUpdate({ src: dataUrl, fill: null });
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Background removal failed:', error);
            alert('Failed to remove background. Please try again.');
        } finally {
            setIsRemovingBg(false);
        }
    };

    return (
        <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-[70px] right-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[50] flex flex-col max-h-[85vh]"
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                    <div className="bg-[#7D2AE8] p-1.5 rounded-lg text-white">
                        <ImageIcon size={18} />
                    </div>
                    <span className="font-bold text-slate-800">Image Editor</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Semantic Mapping */}
            <div className="px-4 py-3 border-b border-slate-100">
                <SemanticTagDropdown
                    value={selection?.semantic}
                    onChange={(tag) => onUpdate({ semantic: tag })}
                    elementType="image"
                />
            </div>

            {/* Tabs */}
            <div className="flex p-1 gap-1 bg-slate-50 border-b border-slate-100">
                <TabButton
                    active={activeTab === 'adjust'}
                    onClick={() => setActiveTab('adjust')}
                    icon={Sliders}
                    label="Adjust"
                />
                <TabButton
                    active={activeTab === 'filters'}
                    onClick={() => setActiveTab('filters')}
                    icon={Sparkles}
                    label="Filters"
                />
                <TabButton
                    active={activeTab === 'style'}
                    onClick={() => setActiveTab('style')}
                    icon={Box}
                    label="Style"
                />
                <TabButton
                    active={activeTab === 'transform'}
                    onClick={() => setActiveTab('transform')}
                    icon={RotateCw}
                    label="Transform"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
                {activeTab === 'adjust' && (
                    <div className="space-y-4">
                        <SliderControl
                            icon={Sun}
                            label="Brightness"
                            value={values.brightness}
                            min={-1}
                            max={1}
                            step={0.05}
                            onChange={(v) => handleChange('brightness', v)}
                            displayValue={Math.round(values.brightness * 100)}
                        />
                        <SliderControl
                            icon={Contrast}
                            label="Contrast"
                            value={values.contrast}
                            min={-100}
                            max={100}
                            step={1}
                            onChange={(v) => handleChange('contrast', v)}
                            displayValue={values.contrast}
                        />
                        <SliderControl
                            icon={Droplet}
                            label="Saturation"
                            value={values.saturation}
                            min={-2}
                            max={5}
                            step={0.1}
                            onChange={(v) => handleChange('saturation', v)}
                            displayValue={values.saturation.toFixed(1)}
                        />
                        <SliderControl
                            icon={Layers}
                            label="Opacity"
                            value={values.opacity}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(v) => handleChange('opacity', v)}
                            displayValue={Math.round(values.opacity * 100) + '%'}
                        />
                    </div>
                )}



                {activeTab === 'filters' && (
                    <div className="space-y-6">
                        <div className="space-y-4 border-b border-slate-100 pb-4">
                            <SliderControl icon={Droplet} label="Blur" value={values.blur} min={0} max={40} step={1} onChange={(v) => handleChange('blurRadius', v)} displayValue={values.blur + 'px'} />
                            <SliderControl icon={Gauge} label="Noise" value={values.noise} min={0} max={1} step={0.05} onChange={(v) => handleChange('noise', v)} displayValue={values.noise.toFixed(2)} />
                            <SliderControl icon={Box} label="Pixelate" value={values.pixelate} min={1} max={20} step={1} onChange={(v) => handleChange('pixelSize', v)} displayValue={values.pixelate + 'px'} />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-sm text-slate-700">Effects</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg p-2 cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" checked={!!values.grayscale} onChange={(e) => handleChange('grayscale', e.target.checked ? 1 : 0)} className="rounded text-[#7D2AE8] focus:ring-[#7D2AE8]" />
                                    B&W
                                </label>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg p-2 cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" checked={!!values.sepia} onChange={(e) => handleChange('sepia', e.target.checked ? 1 : 0)} className="rounded text-[#7D2AE8] focus:ring-[#7D2AE8]" />
                                    Sepia
                                </label>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg p-2 cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" checked={!!values.invert} onChange={(e) => handleChange('invert', e.target.checked ? 1 : 0)} className="rounded text-[#7D2AE8] focus:ring-[#7D2AE8]" />
                                    Invert
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Palette size={14} /> Color Tint
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={values.tintColor || '#ffffff'}
                                        onChange={(e) => handleChange('tintColor', e.target.value)}
                                        className="w-8 h-8 cursor-pointer rounded border border-slate-200"
                                    />
                                    <span className="text-xs text-slate-400">Select color to tint</span>
                                    {values.tintColor && (
                                        <button onClick={() => handleChange('tintColor', '')} className="text-xs text-red-500 hover:text-red-600 underline">Clear</button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Eye size={14} /> Blend Mode
                                </label>
                                <select
                                    value={values.blendMode}
                                    onChange={(e) => handleChange('blendMode', e.target.value)}
                                    className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-[#7D2AE8] outline-none bg-slate-50"
                                >
                                    <option value="source-over">Normal</option>
                                    <option value="multiply">Multiply</option>
                                    <option value="screen">Screen</option>
                                    <option value="overlay">Overlay</option>
                                    <option value="darken">Darken</option>
                                    <option value="lighten">Lighten</option>
                                    <option value="color-dodge">Color Dodge</option>
                                    <option value="color-burn">Color Burn</option>
                                    <option value="hard-light">Hard Light</option>
                                    <option value="soft-light">Soft Light</option>
                                    <option value="difference">Difference</option>
                                    <option value="exclusion">Exclusion</option>
                                    <option value="hue">Hue</option>
                                    <option value="saturation">Saturation</option>
                                    <option value="color">Color</option>
                                    <option value="luminosity">Luminosity</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transform' && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-sm text-slate-700">Flip & Rotate</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => onUpdate({ scaleX: (selection.scaleX || 1) * -1 })}
                                    className="flex items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 font-bold text-xs"
                                >
                                    <FlipHorizontal size={16} /> Flip Horz
                                </button>
                                <button
                                    onClick={() => onUpdate({ scaleY: (selection.scaleY || 1) * -1 })}
                                    className="flex items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 font-bold text-xs"
                                >
                                    <FlipHorizontal size={16} className="rotate-90" /> Flip Vert
                                </button>
                                <button
                                    onClick={() => onUpdate({ rotation: (selection.rotation || 0) - 90 })}
                                    className="flex items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 font-bold text-xs"
                                >
                                    <RotateCw size={16} className="-scale-x-100" /> Rotate 90°
                                </button>
                                <button
                                    onClick={() => onUpdate({ rotation: (selection.rotation || 0) + 90 })}
                                    className="flex items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 font-bold text-xs"
                                >
                                    <RotateCw size={16} /> Rotate 90°
                                </button>
                            </div>
                        </div>

                        {/* AI Background Removal */}
                        <div className="space-y-4 border-t border-slate-100 pt-4">
                            <h3 className="font-bold text-sm text-slate-700">AI Tools</h3>
                            <button
                                onClick={handleRemoveBackground}
                                disabled={isRemovingBg}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                            >
                                {isRemovingBg ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Scissors size={18} /> Remove Background
                                    </>
                                )}
                            </button>
                            {isRemovingBg && (
                                <p className="text-xs text-slate-500 text-center italic">
                                    First use may take 10-15 seconds (downloading AI model)
                                </p>
                            )}
                        </div>
                    </div>
                )}



                {activeTab === 'style' && (
                    <div className="space-y-6">
                        {/* Border Section */}
                        <div className="space-y-4 border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-sm text-slate-700">Border</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Box size={14} /> Corner Radius
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={values.cornerRadius}
                                        onChange={(e) => handleChange('cornerRadius', parseInt(e.target.value))}
                                        className="flex-1 accent-[#7D2AE8] h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs font-mono font-bold w-8 text-right text-slate-600">{values.cornerRadius}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Box size={14} /> Border Width
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0" max="20"
                                        value={values.strokeWidth}
                                        onChange={(e) => handleChange('strokeWidth', parseInt(e.target.value))}
                                        className="flex-1 accent-[#7D2AE8] h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs font-mono font-bold w-8 text-right text-slate-600">{values.strokeWidth}px</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Palette size={14} /> Border Color
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={values.stroke || '#000000'}
                                        onChange={(e) => handleChange('stroke', e.target.value)}
                                        className="w-full h-8 cursor-pointer rounded border border-slate-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shadow Section */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-sm text-slate-700">Shadow</h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Layers size={14} /> Shadow Blur
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0" max="50"
                                        value={values.shadowBlur || 0}
                                        onChange={(e) => handleChange('shadowBlur', parseInt(e.target.value))}
                                        className="flex-1 accent-[#7D2AE8] h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs font-mono font-bold w-8 text-right text-slate-600">{values.shadowBlur || 0}px</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Box size={14} /> Shadow Offset
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="-20" max="20"
                                        value={values.shadowOffsetX || 0}
                                        onChange={(e) => {
                                            handleChange('shadowOffsetX', parseInt(e.target.value));
                                            handleChange('shadowOffsetY', parseInt(e.target.value)); // synced for simplicity
                                        }}
                                        className="flex-1 accent-[#7D2AE8] h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs font-mono font-bold w-8 text-right text-slate-600">{values.shadowOffsetX || 0}px</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Palette size={14} /> Shadow Color
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={values.shadowColor || '#000000'}
                                        onChange={(e) => handleChange('shadowColor', e.target.value)}
                                        className="w-full h-8 cursor-pointer rounded border border-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Layers size={14} /> Shadow Opacity
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0" max="1"
                                        step="0.05"
                                        value={values.shadowOpacity !== undefined ? values.shadowOpacity : 0.5}
                                        onChange={(e) => handleChange('shadowOpacity', parseFloat(e.target.value))}
                                        className="flex-1 accent-[#7D2AE8] h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs font-mono font-bold w-8 text-right text-slate-600">{(values.shadowOpacity !== undefined ? values.shadowOpacity : 0.5).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-3 bg-slate-50 text-[10px] text-slate-400 text-center border-t border-slate-100">
                Changes apply in real-time
            </div>
        </motion.div >
    );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${active
            ? 'bg-white text-[#7D2AE8] shadow-sm border border-slate-200'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
    >
        <Icon size={14} />
        {label}
    </button>
);

const SliderControl = ({ icon: Icon, label, value, min, max, step, onChange, displayValue }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                <Icon size={14} className="text-slate-400" />
                {label}
            </label>
            <span className="text-xs font-mono font-bold text-[#7D2AE8]">{displayValue}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full accent-[#7D2AE8] h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7D2AE8]/20"
        />
    </div>
);

export default ImageEditorPanel;
