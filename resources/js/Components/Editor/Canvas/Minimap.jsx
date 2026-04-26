import React, { useRef, useEffect } from 'react';

const Minimap = ({ pages, scale, stagePos, pageWidth, pageHeight, pageGap, containerWidth, containerHeight, onNavigate }) => {
    const canvasRef = useRef(null);

    // Fixed minimap dimensions
    const mapWidth = 150;
    const mapHeight = 200;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const totalCanvasHeight = pages.length * (pageHeight + pageGap) - pageGap;
        const totalCanvasWidth = pageWidth;

        // Calculate minimap scale to fit all pages
        const scaleX = mapWidth / totalCanvasWidth;
        const scaleY = mapHeight / totalCanvasHeight;
        const minimapScale = Math.min(scaleX, scaleY, 0.15); // Cap at 15% scale

        const scaledPageW = pageWidth * minimapScale;
        const scaledPageH = pageHeight * minimapScale;
        const scaledGap = pageGap * minimapScale;

        // Clear
        ctx.clearRect(0, 0, mapWidth, mapHeight);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, mapWidth, mapHeight);

        // Calculate offset to center pages in minimap
        const totalW = scaledPageW;
        const totalH = pages.length * (scaledPageH + scaledGap) - scaledGap;
        const offsetX = (mapWidth - totalW) / 2;
        const offsetY = (mapHeight - totalH) / 2;

        // Draw pages
        pages.forEach((page, index) => {
            const py = offsetY + index * (scaledPageH + scaledGap);

            // Page background
            if (page.backgroundGradient) {
                const gradient = ctx.createLinearGradient(offsetX, py, offsetX + scaledPageW, py + scaledPageH);
                gradient.addColorStop(0, page.backgroundGradient.startColor || '#ffffff');
                gradient.addColorStop(1, page.backgroundGradient.endColor || '#ffffff');
                ctx.fillStyle = gradient;
            } else if (page.backgroundImage) {
                ctx.fillStyle = '#e0e0e0';
            } else {
                ctx.fillStyle = page.backgroundColor || '#ffffff';
            }
            ctx.fillRect(offsetX, py, scaledPageW, scaledPageH);

            // Page border
            ctx.strokeStyle = page.hidden ? '#444' : '#888';
            ctx.lineWidth = 1;
            ctx.strokeRect(offsetX, py, scaledPageW, scaledPageH);

            // Active page indicator
            if (!page.hidden) {
                ctx.fillStyle = 'rgba(139, 61, 255, 0.3)';
                ctx.fillRect(offsetX, py, scaledPageW, scaledPageH);
            }
        });

        // Draw viewport indicator
        const viewX = (-stagePos.x / scale) * minimapScale + offsetX;
        const viewY = (-stagePos.y / scale) * minimapScale + offsetY;
        const viewW = (containerWidth / scale) * minimapScale;
        const viewH = (containerHeight / scale) * minimapScale;

        ctx.strokeStyle = '#8b3dff';
        ctx.lineWidth = 2;
        ctx.strokeRect(viewX, viewY, viewW, viewH);

    }, [pages, scale, stagePos, pageWidth, pageHeight, pageGap, containerWidth, containerHeight]);

    const handleClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const totalCanvasHeight = pages.length * (pageHeight + pageGap) - pageGap;
        const scaleX = mapWidth / pageWidth;
        const scaleY = mapHeight / totalCanvasHeight;
        const minimapScale = Math.min(scaleX, scaleY, 0.15);

        const scaledPageH = pageHeight * minimapScale;
        const scaledGap = pageGap * minimapScale;
        const totalH = pages.length * (scaledPageH + scaledGap) - scaledGap;
        const offsetY = (mapHeight - totalH) / 2;

        // Find which page was clicked
        const clickY = y - offsetY;
        const pageIndex = Math.floor(clickY / (scaledPageH + scaledGap));

        if (pageIndex >= 0 && pageIndex < pages.length) {
            onNavigate?.(pageIndex);
        }
    };

    return (
        <div className="absolute bottom-4 right-4 bg-[#1a1a2e] rounded-lg shadow-xl border border-white/10 overflow-hidden z-30 select-none"
            style={{ width: mapWidth, height: mapHeight }}
        >
            <canvas
                ref={canvasRef}
                width={mapWidth}
                height={mapHeight}
                onClick={handleClick}
                className="cursor-pointer"
            />
        </div>
    );
};

export default Minimap;
