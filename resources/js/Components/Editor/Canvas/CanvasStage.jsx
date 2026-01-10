import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Rect, Text, Image, Transformer, Line, Group, Ellipse, Star, Arrow, RegularPolygon } from 'react-konva';
import useImage from 'use-image';
import ElementPopover from './ElementPopover';

const ELEMENT_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    rect: 'rect',
    circle: 'circle',
    star: 'star',
    arrow: 'arrow',
    line: 'line',
    triangle: 'triangle',
    polygon: 'polygon',
};

const Element = ({ shapeProps, onSelect, onChange, onDragMove, onDragEnd, onStartEditing, isEditing, shapeRef, isHandMode }) => {

    // Common props for all shapes
    const commonProps = {
        onClick: (e) => onSelect(e, shapeProps.id),
        onTap: (e) => onSelect(e, shapeProps.id),
        ref: shapeRef,
        ...shapeProps,
        draggable: !isEditing && !isHandMode && !shapeProps.locked,
        onDragMove,
        onDragEnd: (e) => {
            onChange({
                ...shapeProps,
                x: e.target.x(),
                y: e.target.y(),
                rotation: e.target.rotation(),
            });
            onDragEnd(); // for guides cleanup
        },
        onTransformEnd: (e) => {
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);

            onChange({
                ...shapeProps,
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
                rotation: node.rotation(),
            });
        }
    };

    if (shapeProps.type === ELEMENT_TYPES.TEXT) {
        let textContent = shapeProps.text;

        // Handle visual text transformation
        if (shapeProps.textTransform === 'uppercase') {
            textContent = textContent?.toUpperCase() || '';
        }

        // Handle list capability (visual only for non-editing)
        if (shapeProps.listType === 'bullet') {
            // Split lines and add bullets
            textContent = (textContent || '').split('\n').map(line => `• ${line}`).join('\n');
        }

        return (
            <Text
                {...commonProps}
                text={textContent} // Override text prop for visual rendering
                onDblClick={onStartEditing}
                onDblTap={onStartEditing}
                visible={!isEditing}
                onTransformEnd={(e) => {
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        fontSize: Math.max(5, Math.round(node.fontSize() * scaleY)),
                        width: Math.max(5, node.width() * scaleX),
                        rotation: node.rotation(),
                    });
                }}
            />
        );
    }

    if (shapeProps.type === ELEMENT_TYPES.IMAGE) {
        return <KonvaImage commonProps={commonProps} src={shapeProps.src} />;
    }

    if (shapeProps.type === 'circle') {
        return <Ellipse {...commonProps} radiusX={shapeProps.width / 2} radiusY={shapeProps.height / 2} />;
    }

    if (shapeProps.type === 'star') {
        return (
            <Star
                {...commonProps}
                numPoints={5}
                innerRadius={shapeProps.width / 4}
                outerRadius={shapeProps.width / 2}
            />
        );
    }

    if (shapeProps.type === 'arrow') {
        // Arrow points from (0,0) to (width, 0)
        return (
            <Arrow
                {...commonProps}
                points={[0, 0, shapeProps.width, 0]}
                pointerLength={10}
                pointerWidth={10}
            />
        );
    }

    if (shapeProps.type === 'line') {
        return (
            <Line
                {...commonProps}
                points={[0, 0, shapeProps.width, 0]}
                strokeWidth={5}
            />
        );
    }

    if (shapeProps.type === 'triangle') {
        return (
            <RegularPolygon
                {...commonProps}
                sides={3}
                radius={shapeProps.width / 2}
            />
        );
    }

    if (shapeProps.type === 'polygon') {
        return (
            <RegularPolygon
                {...commonProps}
                sides={6}
                radius={shapeProps.width / 2}
            />
        );
    }

    return <Rect {...commonProps} />;
};

const KonvaImage = ({ commonProps, src }) => {
    const [img] = useImage(src, 'anonymous');
    return <Image image={img} {...commonProps} />;
};

import PageToolbar from './PageToolbar';

const CanvasStage = forwardRef(({ pages = [], selectedIds, onSelect, onUpdateElement, onAddElementAt, onUpload, scale = 1, onScaleChange, isHandMode, onDelete, onDuplicate, onAlign, onLayerAction, showGrid, onPageAction, onUpdatePageTitle }, ref) => {
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [guides, setGuides] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [popoverPosition, setPopoverPosition] = useState(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const scrollTimeoutRef = useRef(null);
    const stageRef = useRef();
    const elementRefs = useRef({});
    const trRef = useRef();
    const PAGE_WIDTH = 595;
    const PAGE_HEIGHT = 842;
    const PAGE_GAP = 60;

    const allElements = pages.flatMap(p => p.elements);

    // Track stage position for toolbars
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updatePos = () => {
            if (!stageRef.current) return;
            setStagePos({ x: stageRef.current.x(), y: stageRef.current.y() });
        };
        const interval = setInterval(updatePos, 16);
        return () => clearInterval(interval);
    }, []);


    useImperativeHandle(ref, () => ({
        getStage: () => stageRef.current,
        zoomIn: () => handleManualZoom(1.1),
        zoomOut: () => handleManualZoom(1 / 1.1),
        centerPage: () => centerPage(),
        fitToPage: () => fitToPage()
    }));

    const fitToPage = useCallback(() => {
        if (!containerRef.current) return;

        const padding = 80; // Margin around the page
        const availableWidth = containerRef.current.offsetWidth - padding;
        const availableHeight = containerRef.current.offsetHeight - padding;

        const scaleW = availableWidth / PAGE_WIDTH;
        const scaleH = availableHeight / PAGE_HEIGHT;

        const newScale = Math.min(scaleW, scaleH, 1.5); // Cap at 150%
        onScaleChange(newScale);

        // Center it after a frame to ensure state is applied
        setTimeout(() => centerPage(newScale), 50);
    }, [PAGE_WIDTH, PAGE_HEIGHT, onScaleChange]);

    const centerPage = useCallback((customScale) => {
        if (!stageRef.current || !containerRef.current) return;
        const stage = stageRef.current;
        const container = containerRef.current;

        const containerWidth = container.offsetWidth;
        if (containerWidth === 0) return;

        // Use scale from argument if provided, otherwise fallback to local scale state
        const targetScale = customScale || scale;

        // Calculate centered X position
        const newX = (containerWidth / 2) - (PAGE_WIDTH * targetScale / 2);
        const newY = 50; // Fixed top margin

        stage.position({ x: newX, y: newY });
        stage.batchDraw();
    }, [scale, PAGE_WIDTH]);

    // Initial centering - ONLY triggers when dimensions are first captured
    useEffect(() => {
        if (dimensions.width > 0 && !isInitialized) {
            // Use a slight timeout to ensure Konva has fully mounted
            const timeout = setTimeout(() => {
                centerPage(scale);
                setIsInitialized(true);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [dimensions.width, isInitialized]); // Removed centerPage dependency to prevent scale reactivity

    const handleManualZoom = (factor) => {
        const stage = stageRef.current;
        const oldScale = scale;
        const newScale = Math.max(0.05, Math.min(5, oldScale * factor));

        if (newScale !== oldScale) {
            const center = {
                x: dimensions.width / 2,
                y: dimensions.height / 2
            };

            const mousePointTo = {
                x: (center.x - stage.x()) / oldScale,
                y: (center.y - stage.y()) / oldScale,
            };

            onScaleChange(newScale);

            const newPos = {
                x: center.x - mousePointTo.x * newScale,
                y: center.y - mousePointTo.y * newScale,
            };

            stage.position(newPos);
            stage.batchDraw();
        }
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();
        // Force update on mount
        setTimeout(updateDimensions, 100);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (!trRef.current) return;

        const nodes = selectedIds
            .map(id => elementRefs.current[id])
            .filter(node => node !== undefined);

        trRef.current.nodes(nodes);
        trRef.current.getLayer().batchDraw();
    }, [selectedIds, pages]);

    const handleSelect = (e, id) => {
        if (isHandMode) return;

        const isShift = e.evt.shiftKey;

        // Check if the element belongs to a hidden or locked page
        const parentPage = pages.find(p => p.elements.some(el => el.id === id));
        if (parentPage?.hidden || parentPage?.locked) return;

        if (isShift) {
            if (selectedIds.includes(id)) {
                onSelect(selectedIds.filter(sid => sid !== id));
            } else {
                onSelect([...selectedIds, id]);
            }
        } else {
            if (!selectedIds.includes(id)) {
                onSelect([id]);
            }
        }
        e.cancelBubble = true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        stageRef.current.setPointersPositions(e);
        const stage = stageRef.current;
        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;

        // Global coordinates relative to stage (0,0)
        const stageX = (pointerPos.x - stage.x()) / scale;
        const stageY = (pointerPos.y - stage.y()) / scale;

        // Find which page we're in
        let targetPage = pages[0];
        let localY = stageY;

        pages.forEach((page, index) => {
            const pageTop = index * (PAGE_HEIGHT + PAGE_GAP);
            const pageBottom = pageTop + PAGE_HEIGHT;
            if (stageY >= pageTop && stageY <= pageBottom) {
                targetPage = page;
                localY = stageY - pageTop;
            }
        });

        if (targetPage.locked || targetPage.hidden) return;

        // 1. Handle External File Drop
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                onUpload(file, false).then(url => {
                    if (url) {
                        onAddElementAt('image', {
                            src: url,
                            width: 200,
                            height: 200,
                            x: stageX - 100,
                            y: localY - 100
                        }, targetPage.id);
                    }
                });
            }
            return;
        }

        // 2. Handle Internal Drag & Drop
        const type = e.dataTransfer.getData('type');
        let payload = {};
        try {
            payload = JSON.parse(e.dataTransfer.getData('payload'));
        } catch (err) { }

        if (type) {
            onAddElementAt(type, {
                ...payload,
                x: stageX - (payload.width ? (payload.width / 2) : 50),
                y: localY - (payload.height ? (payload.height / 2) : 50)
            }, targetPage.id);
        }
    };

    const handleDragMove = (e) => {
        if (selectedIds.length > 1) return;

        const target = e.target;
        const parentPage = target.getParent(); // This will be the Group for the page
        const newGuides = [];
        const snapThreshold = 5;

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

        // Find elements on the same page
        let pageElements = [];
        pages.forEach(p => {
            const hasElement = p.elements.some(el => el.id === selectedIds[0]);
            if (hasElement) pageElements = p.elements;
        });

        const others = pageElements
            .filter(el => !selectedIds.includes(el.id))
            .map(el => ({
                left: el.x,
                right: el.x + el.width,
                top: el.y,
                bottom: el.y + el.height,
                centerX: el.x + el.width / 2,
                centerY: el.y + el.height / 2,
            }));

        others.push({
            left: 0, right: PAGE_WIDTH, top: 0, bottom: PAGE_HEIGHT,
            centerX: PAGE_WIDTH / 2, centerY: PAGE_HEIGHT / 2,
        });

        let snappedX = absX;
        let snappedY = absY;
        let guidesFoundX = false;
        let guidesFoundY = false;

        others.forEach(obj => {
            const snapPointsX = [
                { guide: obj.left, item: itemBounds.left, snap: obj.left },
                { guide: obj.right, item: itemBounds.right, snap: obj.right - itemWidth },
                { guide: obj.centerX, item: itemBounds.centerX, snap: obj.centerX - itemWidth / 2 },
            ];

            snapPointsX.forEach(p => {
                if (!guidesFoundX && Math.abs(p.item - p.guide) < snapThreshold) {
                    snappedX = p.snap;
                    newGuides.push({ x: p.guide, y: 0, width: 1 / scale, height: PAGE_HEIGHT, orientation: 'V' });
                    guidesFoundX = true;
                }
            });

            const snapPointsY = [
                { guide: obj.top, item: itemBounds.top, snap: obj.top },
                { guide: obj.bottom, item: itemBounds.bottom, snap: obj.bottom - itemHeight },
                { guide: obj.centerY, item: itemBounds.centerY, snap: obj.centerY - itemHeight / 2 },
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

    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();

        // Handle scrolling state for popover visibility
        setIsScrolling(true);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 200);

        if (e.evt.ctrlKey) {
            // Precise Zoom to Cursor
            const stage = e.target.getStage();
            const pointer = stage.getPointerPosition();

            // Use direct stage scale to avoid transition lag
            const currentScale = stage.scaleX();

            const mousePointTo = {
                x: (pointer.x - stage.x()) / currentScale,
                y: (pointer.y - stage.y()) / currentScale,
            };

            // RESTRICTION: Only zoom if mouse is over the page width area (ignoring gaps for better UX)
            // Calculate total canvas height based on number of pages
            const totalPagesHeight = pages.length * (PAGE_HEIGHT + PAGE_GAP);
            const isOverCanvas = mousePointTo.x >= -50 && mousePointTo.x <= PAGE_WIDTH + 50 &&
                mousePointTo.y >= -50 && mousePointTo.y <= totalPagesHeight;

            if (!isOverCanvas) return;

            const scaleBy = 1.05;
            const oldScale = currentScale;

            const direction = e.evt.deltaY > 0 ? -1 : 1;
            let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
            newScale = Math.max(0.05, Math.min(5, newScale));

            if (newScale !== oldScale) {
                // Immediate stage update for smooth anchoring
                stage.scale({ x: newScale, y: newScale });

                const newPos = {
                    x: pointer.x - mousePointTo.x * newScale,
                    y: pointer.y - mousePointTo.y * newScale,
                };
                stage.position(newPos);
                stage.batchDraw();

                onScaleChange(newScale);
            }
        } else if (e.evt.shiftKey) {
            // Pan logic (Horizontal - Shift + Wheel)
            // Map deltaY to X for horizontal wheel scroll
            const dx = -e.evt.deltaY;
            stage.x(stage.x() + dx);
        } else if (isHandMode) {
            // Pan logic (Vertical - Space + Wheel)
            const dy = -e.evt.deltaY;
            stage.y(stage.y() + dy);
        } else {
            // Normal Pan logic (Default)
            const dx = -e.evt.deltaX;
            const dy = -e.evt.deltaY;
            stage.position({
                x: stage.x() + dx,
                y: stage.y() + dy,
            });
        }
    };

    // Calculate Popover Position
    useEffect(() => {
        if (selectedIds.length === 0 || !stageRef.current || editingId) {
            setPopoverPosition(null);
            return;
        }

        const calculatePosition = () => {
            if (!stageRef.current) return;

            let rect = null;

            // Try using Transformer's rect first (most accurate for combined selection)
            if (trRef.current && selectedIds.length > 0) {
                rect = trRef.current.getClientRect();
            }

            // Fallback to individual element bounding box if transformer rect is zero or not ready
            if (!rect || rect.width === 0) {
                const nodes = selectedIds
                    .map(id => elementRefs.current[id])
                    .filter(node => !!node);

                if (nodes.length === 0) return;

                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                nodes.forEach(node => {
                    const r = node.getClientRect();
                    minX = Math.min(minX, r.x);
                    minY = Math.min(minY, r.y);
                    maxX = Math.max(maxX, r.x + r.width);
                    maxY = Math.max(maxY, r.y + r.height);
                });
                rect = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
            }

            // These are stage-relative coordinates (DOM pixels inside stage container)
            const centerX = rect.x + rect.width / 2;
            const topY = rect.y;

            setPopoverPosition({ x: centerX, y: topY });
        };

        calculatePosition();

        // Update position on drag/transform
        const interval = setInterval(calculatePosition, 16); // ~60fps
        return () => clearInterval(interval);
    }, [selectedIds, pages, scale, dimensions, editingId, stageRef]);

    return (
        <div
            className="flex-1 overflow-hidden bg-[#18191B] relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            ref={containerRef}
        >
            <div className={`w-full h-full relative transition-opacity duration-500 ${isInitialized ? 'opacity-100' : 'opacity-0'} ${isHandMode ? 'cursor-grab active:cursor-grabbing' : ''}`}>

                <Stage
                    width={dimensions.width || window.innerWidth}
                    height={dimensions.height || window.innerHeight}
                    scaleX={scale}
                    scaleY={scale}
                    draggable={isHandMode}
                    onClick={(e) => {
                        if (isHandMode) return;
                        const clickedOnEmpty = e.target === e.target.getStage();
                        if (clickedOnEmpty) onSelect([]);
                    }}
                    onWheel={handleWheel}
                    ref={stageRef}
                >
                    <Layer>
                        {pages.map((page, index) => {
                            const pageY = index * (PAGE_HEIGHT + PAGE_GAP);

                            return (
                                <Group
                                    key={page.id}
                                    y={pageY}
                                    opacity={page.hidden ? 0.3 : 1}
                                >
                                    {/* Page Background */}
                                    <Rect
                                        x={0} y={0} width={PAGE_WIDTH} height={PAGE_HEIGHT}
                                        fill="white"
                                        shadowColor="black" shadowBlur={20} shadowOpacity={0.1}
                                        onClick={(e) => {
                                            if (isHandMode || page.locked) return;
                                            onSelect([]);
                                        }}
                                    />

                                    {/* Clip to page area */}
                                    <Group clip={{ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT }}>
                                        {page.elements.map((el, i) => (
                                            <Element
                                                key={el.id || i}
                                                shapeProps={el}
                                                onSelect={handleSelect}
                                                onChange={(newAttrs) => onUpdateElement(el.id, newAttrs)}
                                                onDragMove={handleDragMove}
                                                onDragEnd={() => setGuides([])}
                                                onStartEditing={() => !isHandMode && !page.locked && setEditingId(el.id)}
                                                isEditing={editingId === el.id}
                                                shapeRef={node => { elementRefs.current[el.id] = node; }}
                                                isHandMode={isHandMode || page.locked || page.hidden}
                                            />
                                        ))}
                                    </Group>

                                    {/* Page Specific Guides */}
                                    {guides.map((guide, i) => (
                                        <Line
                                            key={i}
                                            points={guide.orientation === 'V' ? [guide.x, 0, guide.x, PAGE_HEIGHT] : [0, guide.y, PAGE_WIDTH, guide.y]}
                                            stroke="#7D2AE8"
                                            strokeWidth={1 / scale}
                                            dash={[4, 4]}
                                            listening={false}
                                        />
                                    ))}

                                    {/* Page Grid */}
                                    {showGrid && (
                                        <Group listening={false}>
                                            {Array.from({ length: Math.ceil(PAGE_WIDTH / 50) + 1 }).map((_, i) => (
                                                <Line
                                                    key={`v-${Math.random()}`}
                                                    points={[i * 50, 0, i * 50, PAGE_HEIGHT]}
                                                    stroke="rgba(0,0,0,0.05)"
                                                    strokeWidth={1 / scale}
                                                />
                                            ))}
                                            {Array.from({ length: Math.ceil(PAGE_HEIGHT / 50) + 1 }).map((_, i) => (
                                                <Line
                                                    key={`h-${Math.random()}`}
                                                    points={[0, i * 50, PAGE_WIDTH, i * 50]}
                                                    stroke="rgba(0,0,0,0.05)"
                                                    strokeWidth={1 / scale}
                                                />
                                            ))}
                                        </Group>
                                    )}

                                    {/* Page Lock Overlay */}
                                    {page.locked && (
                                        <Rect
                                            x={0} y={0} width={PAGE_WIDTH} height={PAGE_HEIGHT}
                                            fill="rgba(0,0,0,0.02)"
                                            listening={false}
                                        />
                                    )}
                                </Group>
                            );
                        })}

                        {/* Global Transformer */}
                        <Transformer
                            ref={trRef}
                            flipEnabled={false}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
                                return newBox;
                            }}
                        />
                    </Layer>
                </Stage>

                {/* Multi-Page Toolbars - Placed after Stage for proper event handling */}
                {isInitialized && pages.map((page, index) => (
                    <PageToolbar
                        key={page.id}
                        pageNumber={index + 1}
                        title={page.title}
                        onTitleChange={(title) => onUpdatePageTitle(page.id, title)}
                        onMoveUp={() => onPageAction(page.id, 'moveUp')}
                        onMoveDown={() => onPageAction(page.id, 'moveDown')}
                        onLock={() => onPageAction(page.id, 'lock')}
                        onDuplicate={() => onPageAction(page.id, 'duplicate')}
                        onDelete={() => onPageAction(page.id, 'delete')}
                        onAddPage={() => onPageAction(page.id, 'add')}
                        onHide={() => onPageAction(page.id, 'hide')}
                        isLocked={page.locked}
                        isHidden={page.hidden}
                        style={{
                            position: 'absolute',
                            top: stagePos.y + (index * (PAGE_HEIGHT + PAGE_GAP)) * scale,
                            left: stagePos.x,
                            width: PAGE_WIDTH * scale,
                            zIndex: 10,
                            opacity: page.hidden ? 0.5 : 1,
                        }}
                    />
                ))}

                {editingId && (
                    <TextEditorOverlay
                        element={allElements.find(el => el.id === editingId)}
                        scale={scale}
                        stage={stageRef.current}
                        containerWidth={dimensions.width}
                        pageWidth={PAGE_WIDTH}
                        onSave={(newText) => {
                            onUpdateElement(editingId, { text: newText });
                            setEditingId(null);
                        }}
                        onCancel={() => setEditingId(null)}
                    />
                )}

                {/* Element Popover (Mini-Pill) */}
                {popoverPosition && selectedIds.length > 0 && !editingId && (
                    <ElementPopover
                        position={popoverPosition}
                        selection={allElements.find(el => el.id === selectedIds[selectedIds.length - 1])}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                        onLockToggle={() => {
                            const selection = allElements.find(el => el.id === selectedIds[selectedIds.length - 1]);
                            onUpdateElement(selectedIds, { locked: !selection?.locked });
                        }}
                        isMultiSelect={selectedIds.length > 1}
                        onAlign={onAlign}
                        onLayerAction={onLayerAction}
                        isScrolling={isScrolling}
                    />
                )}
            </div>
        </div>
    );
});

export default CanvasStage;

const TextEditorOverlay = ({ element, scale, onSave, onCancel, stage, containerWidth, pageWidth }) => {
    const [text, setText] = useState(element.text);
    const textareaRef = useRef();

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
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

    if (!stage) return null;

    const stageX = stage.x();
    const stageY = stage.y();

    const absX = stageX + element.x * scale;
    const absY = stageY + element.y * scale;

    return (
        <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => onSave(text)}
            onKeyDown={handleKeyDown}
            style={{
                position: 'fixed',
                top: absY,
                left: absX,
                width: (element.width || 200) * scale,
                height: (element.height || element.fontSize * 1.5) * scale * 1.5,
                fontSize: (element.fontSize || 12) * scale,
                fontFamily: element.fontFamily || 'Inter',
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle || 'normal',
                color: element.fill || '#000000',
                background: 'transparent',
                border: '1px solid #7D2AE8',
                padding: '0px',
                margin: '0px',
                lineHeight: element.lineHeight || 1.1, // Adjusted closer to konva
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                zIndex: 9999,
                transform: `rotate(${element.rotation}deg)`,
                transformOrigin: 'top left',
            }}
        />
    );
};
