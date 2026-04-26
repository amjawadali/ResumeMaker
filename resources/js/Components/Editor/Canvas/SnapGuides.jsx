import React from 'react';
import { Line, Rect } from 'react-konva';

/**
 * SnapGuides - Renders alignment guides in the Konva canvas.
 * Shows center lines and equal-spacing indicators when elements are near
 * alignment thresholds.
 */
export default function SnapGuides({ stageWidth, stageHeight, elements, selectedIds }) {
    const guides = [];
    const threshold = 5;

    if (selectedIds.length === 0) return null;

    const selectedElements = elements.filter(el => selectedIds.includes(el.id));
    if (selectedElements.length === 0) return null;

    const getBounds = (el) => ({
        cx: el.x + (el.width || 100) / 2,
        cy: el.y + (el.height || 20) / 2,
        left: el.x,
        right: el.x + (el.width || 100),
        top: el.y,
        bottom: el.y + (el.height || 20),
    });

    const unselected = elements.filter(el => !selectedIds.includes(el.id));

    const selectedBounds = selectedElements.map(getBounds);

    // Center alignments (horizontal and vertical)
    const stageCenterX = stageWidth / 2;
    const stageCenterY = stageHeight / 2;

    selectedBounds.forEach(sel => {
        // Stage center vertical
        if (Math.abs(sel.cx - stageCenterX) < threshold) {
            guides.push(
                <Line
                    key={`v-center-stage-${sel.cx}`}
                    points={[stageCenterX, 0, stageCenterX, stageHeight]}
                    stroke="#7D2AE8"
                    strokeWidth={1}
                    dash={[4, 4]}
                    opacity={0.6}
                />
            );
        }
        // Stage center horizontal
        if (Math.abs(sel.cy - stageCenterY) < threshold) {
            guides.push(
                <Line
                    key={`h-center-stage-${sel.cy}`}
                    points={[0, stageCenterY, stageWidth, stageCenterY]}
                    stroke="#7D2AE8"
                    strokeWidth={1}
                    dash={[4, 4]}
                    opacity={0.6}
                />
            );
        }

        // Alignment with other elements
        unselected.forEach(other => {
            const oth = getBounds(other);
            // Vertical center alignment
            if (Math.abs(sel.cx - oth.cx) < threshold) {
                guides.push(
                    <Line
                        key={`v-align-${other.id}-${sel.cx}`}
                        points={[oth.cx, Math.min(sel.top, oth.top) - 10, oth.cx, Math.max(sel.bottom, oth.bottom) + 10]}
                        stroke="#7D2AE8"
                        strokeWidth={1}
                        dash={[4, 4]}
                        opacity={0.6}
                    />
                );
            }
            // Horizontal center alignment
            if (Math.abs(sel.cy - oth.cy) < threshold) {
                guides.push(
                    <Line
                        key={`h-align-${other.id}-${sel.cy}`}
                        points={[Math.min(sel.left, oth.left) - 10, oth.cy, Math.max(sel.right, oth.right) + 10, oth.cy]}
                        stroke="#7D2AE8"
                        strokeWidth={1}
                        dash={[4, 4]}
                        opacity={0.6}
                    />
                );
            }
            // Left edge alignment
            if (Math.abs(sel.left - oth.left) < threshold) {
                guides.push(
                    <Line
                        key={`left-align-${other.id}`}
                        points={[sel.left, Math.min(sel.top, oth.top) - 10, sel.left, Math.max(sel.bottom, oth.bottom) + 10]}
                        stroke="#3B82F6"
                        strokeWidth={1}
                        dash={[4, 4]}
                        opacity={0.5}
                    />
                );
            }
            // Right edge alignment
            if (Math.abs(sel.right - oth.right) < threshold) {
                guides.push(
                    <Line
                        key={`right-align-${other.id}`}
                        points={[sel.right, Math.min(sel.top, oth.top) - 10, sel.right, Math.max(sel.bottom, oth.bottom) + 10]}
                        stroke="#3B82F6"
                        strokeWidth={1}
                        dash={[4, 4]}
                        opacity={0.5}
                    />
                );
            }
            // Top edge alignment
            if (Math.abs(sel.top - oth.top) < threshold) {
                guides.push(
                    <Line
                        key={`top-align-${other.id}`}
                        points={[Math.min(sel.left, oth.left) - 10, sel.top, Math.max(sel.right, oth.right) + 10, sel.top]}
                        stroke="#3B82F6"
                        strokeWidth={1}
                        dash={[4, 4]}
                        opacity={0.5}
                    />
                );
            }
            // Bottom edge alignment
            if (Math.abs(sel.bottom - oth.bottom) < threshold) {
                guides.push(
                    <Line
                        key={`bottom-align-${other.id}`}
                        points={[Math.min(sel.left, oth.left) - 10, sel.bottom, Math.max(sel.right, oth.right) + 10, sel.bottom]}
                        stroke="#3B82F6"
                        strokeWidth={1}
                        dash={[4, 4]}
                        opacity={0.5}
                    />
                );
            }
        });
    });

    if (guides.length === 0) return null;

    return <>{guides}</>;
}
