import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image, Transformer, Line } from 'react-konva';
import useImage from 'use-image';

const ELEMENT_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    SHAPE: 'rect',
};

const Element = ({ shapeProps, isSelected, onSelect, onChange, onDragMove, onDragEnd, onStartEditing, isEditing }) => {
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const handleDragEndInternal = (e) => {
        onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
            rotation: e.target.rotation(),
        });
        onDragEnd();
    };

    const handleTransformEnd = (e) => {
        // transformer is changing scale of the node
        // so we need to update state
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // we will reset it back
        node.scaleX(1);
        node.scaleY(1);

        onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
        });
    };

    if (shapeProps.type === ELEMENT_TYPES.TEXT) {
        return (
            <EditableText
                shapeProps={shapeProps}
                isSelected={isSelected}
                onSelect={onSelect}
                onChange={onChange}
                onDragMove={onDragMove}
                onDragEnd={handleDragEndInternal}
                onStartEditing={onStartEditing}
                isEditing={isEditing}
                shapeRef={shapeRef}
                trRef={trRef}
            />
        );
    }

    if (shapeProps.type === ELEMENT_TYPES.IMAGE) {
        // Image handling is a bit complex with useImage
        return <KonvaImage shapeProps={shapeProps} isSelected={isSelected} onSelect={onSelect} onChange={onChange} onDragMove={onDragMove} onDragEnd={handleDragEndInternal} shapeRef={shapeRef} trRef={trRef} handleDragEndInternal={handleDragEndInternal} handleTransformEnd={handleTransformEnd} />;
    }

    return (
        <React.Fragment>
            <Rect
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                {...shapeProps}
                draggable
                onDragMove={onDragMove}
                onDragEnd={handleDragEndInternal}
                onTransformEnd={handleTransformEnd}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    flipEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};

const KonvaImage = ({ shapeProps, isSelected, onSelect, onChange, onDragMove, onDragEnd, shapeRef, trRef, handleDragEndInternal, handleTransformEnd }) => {
    const [img] = useImage(shapeProps.src);
    return (
        <React.Fragment>
            <Image
                image={img}
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                {...shapeProps}
                draggable
                onDragMove={onDragMove}
                onDragEnd={onDragEnd}
                onTransformEnd={handleTransformEnd}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    flipEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};

export default function CanvasStage({ elements, selectedId, onSelect, onUpdateElement, onAddElementAt, scale = 1, onScaleChange, stageRef }) {
    const containerRef = useRef();
    const [guides, setGuides] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const PAGE_WIDTH = 595;
    const PAGE_HEIGHT = 842;

    const handleDrop = (e) => {
        e.preventDefault();
        stageRef.current.setPointersPositions(e);

        const type = e.dataTransfer.getData('type');
        const payload = JSON.parse(e.dataTransfer.getData('payload'));

        // Use the stage's scale to find the actual point in the coordinate system
        const stage = stageRef.current;
        const pointerPos = stage.getPointerPosition();

        // Convert screen coordinates (px) to stage units (A4 points)
        const x = pointerPos.x / scale;
        const y = pointerPos.y / scale;

        onAddElementAt(type, {
            ...payload,
            x: x - (payload.width ? (payload.width / 2) : 0),
            y: y - (payload.height ? (payload.height / 2) : 0)
        });
    };

    const handleDragMove = (e) => {
        const target = e.target;
        const stage = target.getStage();
        const newGuides = [];
        const snapThreshold = 5;

        // Current item's bounds
        const itemWidth = target.width() * target.scaleX();
        const itemHeight = target.height() * target.scaleY();
        const absX = target.x();
        const absY = target.y();

        const itemBounds = {
            left: absX,
            right: absX + itemWidth,
            top: absY,
            bottom: absY + itemHeight,
            centerX: absX + itemWidth / 2,
            centerY: absY + itemHeight / 2,
        };

        // All other elements + Page
        const others = elements
            .filter(el => el.id !== selectedId)
            .map(el => ({
                left: el.x,
                right: el.x + el.width,
                top: el.y,
                bottom: el.y + el.height,
                centerX: el.x + el.width / 2,
                centerY: el.y + el.height / 2,
            }));

        // Add page centers
        others.push({
            left: 0,
            right: PAGE_WIDTH,
            top: 0,
            bottom: PAGE_HEIGHT,
            centerX: PAGE_WIDTH / 2,
            centerY: PAGE_HEIGHT / 2,
        });

        let snappedX = absX;
        let snappedY = absY;

        let guidesFoundX = false;
        let guidesFoundY = false;

        others.forEach(obj => {
            // Vertical Guides (Aligning X)
            const snapPointsX = [
                { guide: obj.left, item: itemBounds.left, snap: obj.left },
                { guide: obj.right, item: itemBounds.right, snap: obj.right - itemWidth },
                { guide: obj.centerX, item: itemBounds.centerX, snap: obj.centerX - itemWidth / 2 },
                { guide: obj.left, item: itemBounds.right, snap: obj.left - itemWidth },
                { guide: obj.right, item: itemBounds.left, snap: obj.right },
            ];

            snapPointsX.forEach(p => {
                if (!guidesFoundX && Math.abs(p.item - p.guide) < snapThreshold) {
                    snappedX = p.snap;
                    newGuides.push({ x: p.guide, y: 0, width: 1 / scale, height: PAGE_HEIGHT, orientation: 'V' });
                    guidesFoundX = true;
                }
            });

            // Horizontal Guides (Aligning Y)
            const snapPointsY = [
                { guide: obj.top, item: itemBounds.top, snap: obj.top },
                { guide: obj.bottom, item: itemBounds.bottom, snap: obj.bottom - itemHeight },
                { guide: obj.centerY, item: itemBounds.centerY, snap: obj.centerY - itemHeight / 2 },
                { guide: obj.top, item: itemBounds.bottom, snap: obj.top - itemHeight },
                { guide: obj.bottom, item: itemBounds.top, snap: obj.bottom },
            ];

            snapPointsY.forEach(p => {
                if (!guidesFoundY && Math.abs(p.item - p.guide) < snapThreshold) {
                    snappedY = p.snap;
                    newGuides.push({ x: 0, y: p.guide, width: PAGE_WIDTH, height: 1 / scale, orientation: 'H' });
                    guidesFoundY = true;
                }
            });
        });

        target.x(snappedX);
        target.y(snappedY);
        setGuides(newGuides);
    };

    const handleDragEnd = () => {
        setGuides([]);
    };

    const handleWheel = (e) => {
        // Only zoom if Ctrl is pressed (standard for pinch-to-zoom on touchpads)
        if (e.evt.ctrlKey) {
            e.evt.preventDefault();

            const scaleBy = 1.05;
            const stage = e.target.getStage();
            const oldScale = scale;

            const pointer = stage.getPointerPosition();

            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };

            const direction = e.evt.deltaY > 0 ? -1 : 1;
            const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

            // Constrain zoom
            if (newScale >= 0.1 && newScale <= 3) {
                onScaleChange(newScale);
            }
        }
    };

    return (
        <div
            className="flex-1 overflow-auto bg-[#18191B] scrollbar-hide select-none relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            ref={containerRef}
        >
            <div
                className="min-h-full min-w-full flex p-10"
                style={{ width: 'fit-content' }}
            >
                <div
                    className="bg-white shadow-2xl relative m-auto"
                    style={{
                        width: PAGE_WIDTH * scale,
                        height: PAGE_HEIGHT * scale,
                        minWidth: PAGE_WIDTH * scale,
                        minHeight: PAGE_HEIGHT * scale,
                    }}
                >
                    <Stage
                        width={PAGE_WIDTH * scale}
                        height={PAGE_HEIGHT * scale}
                        scaleX={scale}
                        scaleY={scale}
                        onClick={(e) => {
                            const clickedOnEmpty = e.target === e.target.getStage();
                            if (clickedOnEmpty) onSelect(null);
                        }}
                        onWheel={handleWheel}
                        ref={stageRef}
                    >
                        <Layer perfectDrawEnabled={false}>
                            {elements.map((el, i) => (
                                <Element
                                    key={el.id || i}
                                    shapeProps={el}
                                    isSelected={el.id === selectedId}
                                    onSelect={() => onSelect(el.id)}
                                    onChange={(newAttrs) => onUpdateElement(el.id, newAttrs)}
                                    onDragMove={handleDragMove}
                                    onDragEnd={handleDragEnd}
                                    onStartEditing={() => setEditingId(el.id)}
                                    isEditing={editingId === el.id}
                                />
                            ))}
                            {guides.map((guide, i) => (
                                <Line
                                    key={i}
                                    points={guide.orientation === 'V'
                                        ? [guide.x, 0, guide.x, PAGE_HEIGHT]
                                        : [0, guide.y, PAGE_WIDTH, guide.y]
                                    }
                                    stroke="#7D2AE8"
                                    strokeWidth={1 / scale}
                                    dash={[4, 4]}
                                    listening={false}
                                />
                            ))}
                        </Layer>
                    </Stage>

                    {/* Text Editing Overlay */}
                    {editingId && (
                        <TextEditorOverlay
                            element={elements.find(el => el.id === editingId)}
                            scale={scale}
                            onSave={(newText) => {
                                onUpdateElement(editingId, { text: newText });
                                setEditingId(null);
                            }}
                            onCancel={() => setEditingId(null)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

const TextEditorOverlay = ({ element, scale, onSave, onCancel }) => {
    const [text, setText] = useState(element.text);
    const textareaRef = useRef();

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSave(text);
        }
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => onSave(text)}
            onKeyDown={handleKeyDown}
            style={{
                position: 'absolute',
                top: (element.y * scale),
                left: (element.x * scale),
                width: (element.width || 200) * scale,
                height: (element.fontSize * 1.2) * scale, // Tight height for better fit
                fontSize: (element.fontSize || 12) * scale,
                fontFamily: element.fontFamily || 'Inter',
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle === 'italic' ? 'italic' : 'normal',
                color: element.fill || '#000000',
                textAlign: element.align || 'left',
                lineHeight: 1, // Konva default is closer to 1
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                zIndex: 1000,
                transform: `rotate(${element.rotation || 0}deg)`,
                transformOrigin: 'top left',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                caretColor: element.fill || '#000000',
            }}
            className="selection:bg-[#7D2AE8]/20"
        />
    );
};

const EditableText = ({ shapeProps, isSelected, onSelect, onStartEditing, shapeRef, trRef, onDragMove, onDragEnd, onChange, isEditing }) => {
    return (
        <React.Fragment>
            <Text
                onClick={onSelect}
                onTap={onSelect}
                onDblClick={onStartEditing}
                onDblTap={onStartEditing}
                ref={shapeRef}
                {...shapeProps}
                visible={!isEditing}
                draggable={!isEditing}
                onDragMove={onDragMove}
                onDragEnd={onDragEnd}
                onTransform={(e) => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // Reset scale and update fontSize/width instead
                    node.scaleX(1);
                    node.scaleY(1);

                    const newFontSize = Math.max(5, Math.round(node.fontSize() * scaleY));
                    const newWidth = Math.max(5, node.width() * scaleX);

                    node.fontSize(newFontSize);
                    node.width(newWidth);
                }}
                onTransformEnd={(e) => {
                    const node = shapeRef.current;
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        fontSize: node.fontSize(),
                        width: node.width(),
                        rotation: node.rotation(),
                    });
                }}
            />
            {isSelected && !isEditing && (
                <Transformer
                    ref={trRef}
                    flipEnabled={false}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};
