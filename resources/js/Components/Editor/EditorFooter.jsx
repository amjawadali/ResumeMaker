import React from 'react';
import { Monitor, LayoutGrid, Maximize2, HelpCircle, Minus, Plus } from 'lucide-react';

export default function EditorFooter({ scale, onScaleChange, onFitToPage, onToggleGrid, showGrid }) {
    const minScale = 0.1;
    const maxScale = 3.0;

    const percentage = Math.round(scale * 100);

    const handleSliderChange = (e) => {
        onScaleChange(parseFloat(e.target.value));
    };

    const handleZoomOut = () => {
        onScaleChange(Math.max(minScale, scale - 0.1));
    };

    const handleZoomIn = () => {
        onScaleChange(Math.min(maxScale, scale + 0.1));
    };

    return (
        <div className="h-10 bg-[#0e1217] border-t border-white/5 flex items-center justify-between px-4 text-gray-400 select-none z-50">
            {/* Left Section: Placeholder */}
            <div className="flex items-center gap-4">
                <div className="w-[18px]"></div>
            </div>

            {/* Center Section: Zoom Controls */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleZoomOut}
                        className="hover:text-white transition-colors p-1"
                    >
                        <Minus size={14} />
                    </button>

                    <div className="relative group w-32 flex items-center">
                        <input
                            type="range"
                            min={minScale}
                            max={maxScale}
                            step={0.01}
                            value={scale}
                            onChange={handleSliderChange}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-purple-400 transition-all custom-slider"
                        />
                    </div>

                    <button
                        onClick={handleZoomIn}
                        className="hover:text-white transition-colors p-1"
                    >
                        <Plus size={14} />
                    </button>

                    <div className="w-12 text-center text-xs font-medium tabular-nums text-gray-300">
                        {percentage}%
                    </div>
                </div>

                <div className="h-4 w-px bg-white/10 mx-1"></div>

                {/* Page Controls */}
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 hover:text-white transition-colors p-1 group">
                        <Monitor size={18} />
                        <span className="text-xs font-semibold">Pages</span>
                    </button>

                    <div className="text-xs font-medium text-gray-300 tabular-nums">
                        1 / 1
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={onToggleGrid}
                            className={`p-1.5 rounded-md transition-colors ${showGrid ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'hover:bg-white/10 border border-transparent'}`}
                            title="Toggle Grid"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={onFitToPage}
                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors border border-transparent"
                            title="Fit and Center Page"
                        >
                            <Maximize2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right side placeholder to keep center centered */}
            <div className="w-[18px]"></div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    background: white;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    border: 2px solid #0e1217;
                    transition: all 0.2s;
                }
                .custom-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                    background: #a855f7;
                }
            `}} />
        </div>
    );
}
