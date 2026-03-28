import React from 'react';
import { X, Minus, Plus, Square, Hexagon, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShapeEditorPanel({ selection, onClose, onUpdate }) {
    if (!selection) return null;

    const shapeType = selection.type;

    const handleUpdate = (updates) => {
        onUpdate(selection.id, updates);
    };

    return (
        <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-[64px] left-[72px] bottom-4 w-[320px] bg-white rounded-xl border border-gray-200 shadow-2xl z-[40] overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 capitalize">{shapeType} Settings</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Rect Settings */}
                {shapeType === 'rect' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-3">
                            <Square size={20} className="text-gray-500" />
                            <span className="text-sm text-gray-600">Rectangle Properties</span>
                        </div>

                        <SliderControl
                            label="Corner Radius"
                            value={selection.cornerRadius || 0}
                            onChange={(v) => handleUpdate({ cornerRadius: v })}
                            min={0}
                            max={100}
                        />
                    </div>
                )}

                {/* Star Settings */}
                {shapeType === 'star' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-3">
                            <Star size={20} className="text-gray-500" />
                            <span className="text-sm text-gray-600">Star Properties</span>
                        </div>

                        <SliderControl
                            label="Points"
                            value={selection.numPoints || 5}
                            onChange={(v) => handleUpdate({ numPoints: v })}
                            min={3}
                            max={20}
                            step={1}
                        />

                        <SliderControl
                            label="Inner Radius Ratio"
                            value={(selection.innerRadiusRatio || 0.5) * 100}
                            onChange={(v) => handleUpdate({ innerRadiusRatio: v / 100 })}
                            min={10}
                            max={90}
                            unit="%"
                        />
                    </div>
                )}

                {/* Polygon Settings */}
                {shapeType === 'polygon' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-3">
                            <Hexagon size={20} className="text-gray-500" />
                            <span className="text-sm text-gray-600">Polygon Properties</span>
                        </div>

                        <SliderControl
                            label="Sides"
                            value={selection.sides || 6}
                            onChange={(v) => handleUpdate({ sides: v })}
                            min={3}
                            max={20}
                            step={1}
                        />
                    </div>
                )}

                {/* Common Style Settings (Stroke) */}
                <div className="pt-6 border-t border-gray-100 space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Border</h4>

                    <ColorControl
                        label="Border Color"
                        value={selection.stroke || '#000000'}
                        onChange={(v) => handleUpdate({ stroke: v })}
                        onClear={() => handleUpdate({ stroke: null })}
                    />

                    <SliderControl
                        label="Border Width"
                        value={selection.strokeWidth || 0}
                        onChange={(v) => handleUpdate({ strokeWidth: v })}
                        min={0}
                        max={20}
                    />

                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-gray-700">Border Style</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleUpdate({ dash: [] })}
                                className={`flex-1 h-8 border rounded flex items-center justify-center ${!selection.dash || selection.dash.length === 0 ? 'bg-purple-50 border-purple-500' : 'border-gray-300'}`}
                            >
                                <div className="w-8 h-0.5 bg-current"></div>
                            </button>
                            <button
                                onClick={() => handleUpdate({ dash: [10, 5] })}
                                className={`flex-1 h-8 border rounded flex items-center justify-center ${selection.dash && selection.dash[0] === 10 ? 'bg-purple-50 border-purple-500' : 'border-gray-300'}`}
                            >
                                <div className="w-8 h-0 border-t-2 border-dashed border-current"></div>
                            </button>
                            <button
                                onClick={() => handleUpdate({ dash: [2, 4] })}
                                className={`flex-1 h-8 border rounded flex items-center justify-center ${selection.dash && selection.dash[0] === 2 ? 'bg-purple-50 border-purple-500' : 'border-gray-300'}`}
                            >
                                <div className="w-8 h-0 border-t-2 border-dotted border-current"></div>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}

function SliderControl({ label, value, onChange, min, max, step = 1, unit = '' }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">{label}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onChange(Math.max(min, value - step))}
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                    >
                        <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold text-gray-900 w-10 text-center">{Math.round(value)}{unit}</span>
                    <button
                        onClick={() => onChange(Math.min(max, value + step))}
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
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
        </div>
    );
}

function ColorControl({ label, value, onChange, onClear }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">{label}</span>
                <button onClick={onClear} className="text-[10px] text-red-500 hover:underline">Remove</button>
            </div>
            <div className="relative h-10 w-full">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-full rounded border border-gray-300 cursor-pointer p-0.5"
                />
            </div>
        </div>
    );
}
