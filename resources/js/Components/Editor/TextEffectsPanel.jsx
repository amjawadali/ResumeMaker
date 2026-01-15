import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const EFFECT_STYLES = [
    { id: 'none', label: 'None' },
    { id: 'shadow', label: 'Shadow' },
    { id: 'lift', label: 'Lift' },
    { id: 'hollow', label: 'Hollow' },
    { id: 'splice', label: 'Splice' },
    { id: 'outline', label: 'Outline' },
    { id: 'echo', label: 'Echo' },
    { id: 'glitch', label: 'Glitch' },
    { id: 'neon', label: 'Neon' },
];

export default function TextEffectsPanel({ selection, onClose, onEffectChange }) {
    const [activeTab, setActiveTab] = useState('style'); // 'style' | 'shape' | 'background'
    const [selectedEffect, setSelectedEffect] = useState(selection?.effectType || 'none');
    const [effectParams, setEffectParams] = useState(selection?.effectParams || {
        intensity: 50,
        offset: 30,
        direction: 90,
        color: '#000000',
        color2: '#ff0000',
    });
    const [shapeType, setShapeType] = useState(selection?.shapeType || 'none');
    const [shapeCurve, setShapeCurve] = useState(selection?.shapeCurve || 85);
    const [background, setBackground] = useState(selection?.background || {
        enabled: false,
        roundness: 50,
        spread: 50,
        transparency: 100,
        color: '#000000',
    });

    // Sync local state when selection changes (e.g. from history or other panels)
    useEffect(() => {
        if (selection) {
            setSelectedEffect(selection.effectType || 'none');
            if (selection.effectParams) setEffectParams(selection.effectParams);
            setShapeType(selection.shapeType || 'none');
            if (selection.shapeCurve !== undefined) setShapeCurve(selection.shapeCurve);
            if (selection.background) setBackground(selection.background);
        }
    }, [selection?.id, selection?.effectType, JSON.stringify(selection?.effectParams)]);

    const handleEffectSelect = (effectId) => {
        setSelectedEffect(effectId);
        onEffectChange({ effectType: effectId, effectParams });
    };

    const handleParamChange = (param, value) => {
        const newParams = { ...effectParams, [param]: value };
        setEffectParams(newParams);
        onEffectChange({ effectType: selectedEffect, effectParams: newParams });
    };

    const handleShapeChange = (type) => {
        setShapeType(type);
        onEffectChange({ shapeType: type, shapeCurve });
    };

    const handleBackgroundChange = (updates) => {
        const newBg = { ...background, ...updates };
        setBackground(newBg);
        onEffectChange({ background: newBg });
    };

    if (!selection) {
        return (
            <motion.div
                key="text-effects-panel-empty"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="fixed top-[64px] left-[72px] bottom-4 w-[400px] bg-white rounded-xl border border-gray-200 shadow-2xl z-[40] overflow-hidden flex flex-col items-center justify-center p-8 text-center"
            >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <X size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No selection</h3>
                <p className="text-sm text-gray-500">Select a text element to apply effects</p>
                <button
                    onClick={onClose}
                    className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                    Close Panel
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            key="text-effects-panel"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            className="fixed top-[64px] left-[72px] bottom-4 w-[400px] bg-white rounded-xl border border-gray-200 shadow-2xl z-[40] overflow-hidden flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Effects</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-4">
                <button
                    onClick={() => setActiveTab('style')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'style' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'
                        }`}
                >
                    Style
                </button>
                <button
                    onClick={() => setActiveTab('shape')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'shape' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'
                        }`}
                >
                    Shape
                </button>
                <button
                    onClick={() => setActiveTab('background')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'background' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'
                        }`}
                >
                    Background
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {activeTab === 'style' && (
                    <>
                        {/* Effect Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {EFFECT_STYLES.map((effect) => (
                                <button
                                    key={effect.id}
                                    onClick={() => handleEffectSelect(effect.id)}
                                    className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center transition-all ${selectedEffect === effect.id
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                >
                                    <div className="text-2xl font-bold mb-1" style={getEffectPreviewStyle(effect.id)}>
                                        Ag
                                    </div>
                                    <div className="text-xs text-gray-600">{effect.label}</div>
                                </button>
                            ))}
                        </div>

                        {/* Effect Controls */}
                        {selectedEffect !== 'none' && (
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                {/* Common controls based on effect type */}
                                {(['shadow', 'lift', 'echo'].includes(selectedEffect)) && (
                                    <>
                                        <SliderControl
                                            label="Offset"
                                            value={effectParams.offset}
                                            onChange={(v) => handleParamChange('offset', v)}
                                            min={0}
                                            max={100}
                                        />
                                        <SliderControl
                                            label="Direction"
                                            value={effectParams.direction}
                                            onChange={(v) => handleParamChange('direction', v)}
                                            min={0}
                                            max={360}
                                        />
                                        <ColorControl
                                            label="Color"
                                            value={effectParams.color}
                                            onChange={(v) => handleParamChange('color', v)}
                                        />
                                    </>
                                )}

                                {(['glitch', 'neon'].includes(selectedEffect)) && (
                                    <>
                                        <SliderControl
                                            label="Intensity"
                                            value={effectParams.intensity}
                                            onChange={(v) => handleParamChange('intensity', v)}
                                            min={0}
                                            max={100}
                                        />
                                        {selectedEffect === 'neon' && (
                                            <ColorControl
                                                label="Color"
                                                value={effectParams.color}
                                                onChange={(v) => handleParamChange('color', v)}
                                            />
                                        )}
                                    </>
                                )}

                                {selectedEffect === 'splice' && (
                                    <>
                                        <SliderControl
                                            label="Offset"
                                            value={effectParams.offset}
                                            onChange={(v) => handleParamChange('offset', v)}
                                            min={0}
                                            max={100}
                                        />
                                        <SliderControl
                                            label="Direction"
                                            value={effectParams.direction}
                                            onChange={(v) => handleParamChange('direction', v)}
                                            min={0}
                                            max={360}
                                        />
                                        <div className="flex gap-2">
                                            <ColorControl
                                                label="Color 1"
                                                value={effectParams.color}
                                                onChange={(v) => handleParamChange('color', v)}
                                            />
                                            <ColorControl
                                                label="Color 2"
                                                value={effectParams.color2}
                                                onChange={(v) => handleParamChange('color2', v)}
                                            />
                                        </div>
                                    </>
                                )}

                                {(['hollow', 'outline'].includes(selectedEffect)) && (
                                    <ColorControl
                                        label="Color"
                                        value={effectParams.color}
                                        onChange={(v) => handleParamChange('color', v)}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'shape' && (
                    <>
                        {/* Shape Type Selection */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleShapeChange('none')}
                                className={`aspect-[4/3] border-2 rounded-lg flex flex-col items-center justify-center transition-all ${shapeType === 'none' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <div className="text-xl font-bold mb-1">ABCD</div>
                                <div className="text-xs text-gray-600">None</div>
                            </button>
                            <button
                                onClick={() => handleShapeChange('curve')}
                                className={`aspect-[4/3] border-2 rounded-lg flex flex-col items-center justify-center transition-all ${shapeType === 'curve' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <div className="text-xl font-bold mb-1" style={{ transform: 'rotate(-5deg)' }}>ABCD</div>
                                <div className="text-xs text-gray-600">Curve</div>
                            </button>
                        </div>

                        {/* Curve Controls */}
                        {shapeType === 'curve' && (
                            <div className="pt-4 border-t border-gray-200">
                                <SliderControl
                                    label="Curve"
                                    value={shapeCurve}
                                    onChange={(v) => {
                                        setShapeCurve(v);
                                        onEffectChange({ shapeType, shapeCurve: v });
                                    }}
                                    min={0}
                                    max={100}
                                />
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'background' && (
                    <>
                        {/* Background Toggle */}
                        <button
                            onClick={() => handleBackgroundChange({ enabled: !background.enabled })}
                            className={`w-full aspect-[4/3] border-2 rounded-lg flex flex-col items-center justify-center transition-all ${background.enabled ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <div
                                className="text-2xl font-bold mb-1 px-3 py-1 rounded"
                                style={background.enabled ? { backgroundColor: background.color, color: '#fff' } : {}}
                            >
                                Ag
                            </div>
                            <div className="text-xs text-gray-600">Background</div>
                        </button>

                        {/* Background Controls */}
                        {background.enabled && (
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <SliderControl
                                    label="Roundness"
                                    value={background.roundness}
                                    onChange={(v) => handleBackgroundChange({ roundness: v })}
                                    min={0}
                                    max={100}
                                />
                                <SliderControl
                                    label="Spread"
                                    value={background.spread}
                                    onChange={(v) => handleBackgroundChange({ spread: v })}
                                    min={0}
                                    max={100}
                                />
                                <SliderControl
                                    label="Transparency"
                                    value={background.transparency}
                                    onChange={(v) => handleBackgroundChange({ transparency: v })}
                                    min={0}
                                    max={100}
                                />
                                <ColorControl
                                    label="Color"
                                    value={background.color}
                                    onChange={(v) => handleBackgroundChange({ color: v })}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
}

// Helper Components
function SliderControl({ label, value, onChange, min, max }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">{label}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onChange(Math.max(min, value - 1))}
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                    >
                        <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold text-gray-900 w-10 text-center">{value}</span>
                    <button
                        onClick={() => onChange(Math.min(max, value + 1))}
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                    >
                        <Plus size={12} />
                    </button>
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
        </div>
    );
}

function ColorControl({ label, value, onChange }) {
    return (
        <div className="flex-1">
            <span className="text-xs font-medium text-gray-700 block mb-2">{label}</span>
            <div className="relative">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                />
            </div>
        </div>
    );
}

// Helper function to generate preview styles
function getEffectPreviewStyle(effectId) {
    switch (effectId) {
        case 'shadow':
            return { textShadow: '2px 2px 4px rgba(0,0,0,0.3)' };
        case 'lift':
            return { textShadow: '0 4px 8px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)' };
        case 'hollow':
            return { color: 'transparent', WebkitTextStroke: '2px black' };
        case 'splice':
            return { textShadow: '2px 2px 0 cyan, -2px -2px 0 magenta' };
        case 'outline':
            return { WebkitTextStroke: '1px black' };
        case 'echo':
            return { textShadow: '3px 3px 0 rgba(0,0,0,0.3)' };
        case 'glitch':
            return { textShadow: '2px 0 cyan, -2px 0 magenta' };
        case 'neon':
            return { color: '#ff00ff', textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff' };
        default:
            return {};
    }
}
