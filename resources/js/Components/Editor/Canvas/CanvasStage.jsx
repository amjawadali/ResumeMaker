import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import Konva from 'konva';
import { Stage, Layer, Rect, Text, Image, Transformer, Line, Group, Ellipse, Star, Arrow, RegularPolygon, Label, Tag, TextPath } from 'react-konva';
import useImage from 'use-image';
import ElementPopover from './ElementPopover';
import ContextMenu from './ContextMenu';

const ELEMENT_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    SHAPE: 'shape',
    rect: 'rect',
    circle: 'circle',
    star: 'star',
    arrow: 'arrow',
    line: 'line',
    triangle: 'triangle',
    polygon: 'polygon',
};

const getKonvaEffectProps = (element) => {
    if (element.type !== 'text') return {};
    const { effectType, effectParams = {} } = element;
    const props = {};

    switch (effectType) {
        case 'shadow': {
            const rad = ((effectParams.direction || 0) - 90) * Math.PI / 180;
            const dist = (effectParams.offset || 0) / 2;
            props.shadowColor = effectParams.color || 'rgba(0,0,0,0.5)';
            props.shadowBlur = 5;
            props.shadowOffsetX = Math.cos(rad) * dist;
            props.shadowOffsetY = Math.sin(rad) * dist;
            props.shadowOpacity = (effectParams.intensity || 50) / 100;
            break;
        }
        case 'lift': {
            props.shadowColor = 'rgba(0,0,0,0.4)';
            props.shadowBlur = (effectParams.intensity || 50) / 5;
            props.shadowOffsetX = 0;
            props.shadowOffsetY = (effectParams.intensity || 50) / 10;
            props.shadowOpacity = (effectParams.intensity || 50) / 100;
            break;
        }
        case 'hollow': {
            props.stroke = element.fill || '#000000';
            props.strokeWidth = 1.5;
            props.fillEnabled = false;
            break;
        }
        case 'outline': {
            props.stroke = effectParams.color || '#000000';
            props.strokeWidth = 2;
            props.fillEnabled = true;
            break;
        }
        case 'echo': {
            const rad = ((effectParams.direction || 0) - 90) * Math.PI / 180;
            const dist = (effectParams.offset || 0) / 2;
            props.shadowColor = effectParams.color || 'rgba(0,0,0,0.3)';
            props.shadowBlur = 0;
            props.shadowOffsetX = Math.cos(rad) * dist;
            props.shadowOffsetY = Math.sin(rad) * dist;
            props.shadowOpacity = 1;
            break;
        }
        case 'splice': {
            const rad = ((effectParams.direction || 0) - 90) * Math.PI / 180;
            const dist = (effectParams.offset || 0) / 2;
            props.stroke = effectParams.color || '#000000';
            props.strokeWidth = 1.5;
            props.shadowColor = effectParams.color2 || 'rgba(0,0,0,0.5)';
            props.shadowBlur = 0;
            props.shadowOffsetX = Math.cos(rad) * dist;
            props.shadowOffsetY = Math.sin(rad) * dist;
            props.shadowOpacity = 1;
            break;
        }
        case 'glitch': {
            props.shadowColor = 'rgba(255,0,255,1)';
            props.shadowBlur = 0;
            props.shadowOffsetX = (effectParams.intensity || 50) / 10;
            props.shadowOffsetY = 0;
            break;
        }
        case 'neon': {
            props.shadowColor = effectParams.color || '#ff00ff';
            props.shadowBlur = (effectParams.intensity || 50) / 2;
            props.shadowOpacity = 1;
            props.fill = '#ffffff'; // Neon usually has white core
            break;
        }
        default:
            break;
    }
    return props;
};

const getGradientProps = (element, width, height) => {
    if (element.fillType !== 'gradient' || !element.gradientParams) return {};
    const { startColor, endColor, angle = 90 } = element.gradientParams;

    // Convert angle to rad (adjusting so 0 is Left-Right, 90 is Top-Bottom)
    // Common convention: 0 is East (Right).
    // Gradient logic:
    // If angle 0 (Left->Right): Start (0, h/2), End (w, h/2).
    // Actually, let's use the bounding box center-based approach for rotation freedom.
    const rad = (angle * Math.PI) / 180;
    const w = width || 200;
    const h = height || 50;
    const cx = w / 2;
    const cy = h / 2;
    // Radius of the bounding circle
    const r = Math.sqrt(w * w + h * h) / 2;

    // We project the center along the angle vector
    // Note: In browser coords, Y increases downwards.
    // Angle 90 (Top->Bottom) -> sin(90) = 1. Y increases.
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return {
        fillPriority: 'linear-gradient',
        fillLinearGradientStartPoint: {
            x: cx - r * cos,
            y: cy - r * sin
        },
        fillLinearGradientEndPoint: {
            x: cx + r * cos,
            y: cy + r * sin
        },
        fillLinearGradientColorStops: [0, startColor, 1, endColor]
    };
};

const Element = ({ shapeProps, onSelect, onChange, onDragMove, onDragEnd, onStartEditing, isEditing, shapeRef, isHandMode, scale, isSelected, isInGroup }) => {
    const [isHovered, setIsHovered] = useState(false);
    let elementNode;

    // Common props for all shapes
    const commonProps = {
        onClick: (e) => {
            if (isInGroup) return;
            onSelect(e, shapeProps.id);
        },
        onTap: (e) => {
            if (isInGroup) return;
            onSelect(e, shapeProps.id);
        },
        ref: shapeRef,
        ...shapeProps,
        draggable: !isEditing && !isHandMode && !shapeProps.locked && !isInGroup, // Disable draggable if in group
        onMouseEnter: (e) => {
            if (!isEditing && !isHandMode && !shapeProps.locked && !isInGroup) {
                setIsHovered(true);
                const stage = e.target.getStage();
                if (stage) {
                    stage.container().style.cursor = shapeProps.type === 'text' ? 'text' : 'pointer';
                }
            }
        },
        onMouseLeave: (e) => {
            setIsHovered(false);
            const stage = e.target.getStage();
            if (stage) {
                stage.container().style.cursor = isHandMode ? 'grab' : 'default';
            }
        },
        opacity: isEditing ? 0 : (shapeProps.opacity ?? 1), // Hide original when editing for In-Place feel
        onDragMove: (e) => {
            if (isInGroup) return;
            onDragMove(e);
        },
        onDragEnd: (e) => {
            if (isInGroup) return;
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
            if (!node) return; // Safety check

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

    if (shapeProps.type === 'group') {
        elementNode = (
            <Group
                {...commonProps}
                onTransform={(e) => {
                    const node = e.target;
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        width: node.width() * node.scaleX(),
                        height: node.height() * node.scaleY(),
                        rotation: node.rotation(),
                        scaleX: 1, // Bake scale into width/height if possible, or keep scale?
                        scaleY: 1  // Konva usually keeps scale. But if we resize group, children scale too.
                        // If we want "resize group" to just scale everything, keeping scale is fine.
                        // But our logic usually normalizes.
                        // For Group, normalizing forces processing inputs.
                        // Let's keep scale 1 and update width/height?
                        // Wait, Group width/height doesn't affect children layout automatically unless we repack.
                        // Standard Konva Transformer on Group changes Scale.
                        // So we should save Scale.
                    });
                }}
                onTransformEnd={(e) => {
                    const node = e.target;
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                    });
                }}
            >
                {shapeProps.elements?.map((child) => (
                    <Element
                        key={child.id}
                        shapeProps={child}
                        isInGroup={true}
                        onSelect={() => { }} // No-op
                        onChange={() => { }} // No-op
                        // Pass other dummies
                        onDragMove={() => { }}
                        onDragEnd={() => { }}
                        onStartEditing={() => { }}
                        isEditing={false}
                        isHandMode={isHandMode}
                        scale={scale}
                        isSelected={false}
                    />
                ))}
            </Group>
        );
    } else if (shapeProps.type === ELEMENT_TYPES.TEXT) {
        let textContent = shapeProps.text;

        // Handle visual text transformation
        if (shapeProps.textTransform === 'uppercase') {
            textContent = textContent?.toUpperCase() || '';
        }

        // Handle list capability
        if (shapeProps.listType === 'bullet') {
            textContent = (textContent || '').split('\n').map(line => `• ${line}`).join('\n');
        }

        const effectProps = getKonvaEffectProps(shapeProps);
        const gradientProps = getGradientProps(shapeProps, shapeProps.width, shapeProps.height || (shapeProps.fontSize * 1.2));
        // Exclude width/height from generic props for special wrappers to prevent dual-sizing issues
        const { height, width, ...genericProps } = commonProps;

        // --- 1. CURVE RENDERER (TextPath) ---
        if (shapeProps.shapeType === 'curve' && shapeProps.shapeCurve) {
            const w = shapeProps.width;
            const cy = (shapeProps.shapeCurve || 0) * 1.5;
            const absCy = Math.abs(cy);
            const ctrlY = absCy - cy;
            const data = `M 0,${absCy} Q ${w / 2},${ctrlY} ${w},${absCy}`;

            elementNode = (
                <TextPath
                    {...genericProps}
                    {...effectProps}
                    {...gradientProps}
                    // Pass width explicitly for text wrapping along path if needed,  
                    // though TextPath mainly relies on path length.
                    width={w}
                    text={textContent}
                    data={data}
                    align={shapeProps.align || 'center'}
                    onDblClick={onStartEditing}
                    onDblTap={onStartEditing}
                    visible={!isEditing}
                    onTransform={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        node.setAttrs({ scaleX: 1, scaleY: 1 });
                        onChange({
                            ...shapeProps,
                            x: node.x(),
                            y: node.y(),
                            width: Math.max(5, node.width() * scaleX),
                            fontSize: Math.max(5, node.fontSize() * scaleY),
                            rotation: node.rotation(),
                        });
                    }}
                    onTransformEnd={(e) => {
                        const node = e.target;
                        onChange({
                            ...shapeProps,
                            x: node.x(),
                            y: node.y(),
                            width: node.width(),
                            height: node.height(),
                            fontSize: Math.round(node.fontSize()),
                            rotation: node.rotation(),
                        });
                    }}
                />
            );
        }
        // --- 2. BACKGROUND RENDERER (Group + Rect + Text) ---
        else if (shapeProps.background?.enabled) {
            const bg = shapeProps.background;
            const spread = bg.spread ? bg.spread : 20; // Default spread if missing

            elementNode = (
                <Group
                    {...genericProps}
                    onDblClick={onStartEditing}
                    onDblTap={onStartEditing}
                    visible={!isEditing}
                    onTransform={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        node.setAttrs({ scaleX: 1, scaleY: 1 });

                        const textNode = node.findOne('Text');
                        const rectNode = node.findOne('Rect');

                        if (textNode) {
                            const newWidth = Math.max(5, textNode.width() * scaleX);
                            const newFontSize = Math.max(5, textNode.fontSize() * scaleY);
                            textNode.width(newWidth);
                            textNode.fontSize(newFontSize);

                            // Manually sync Rect during drag for smoothness
                            if (rectNode) {
                                // We need text height (approximate or real)
                                // textNode.height() might not update instantly during transform without a redraw?
                                // Konva Text height is auto-calculated.
                                // We'll rely on auto-calc for height in Rect if possible?
                                // Actually, we can just update Rect width relative to Text width:
                                rectNode.width(newWidth + spread);
                                // For height, it's tricky without accurate measurement. 
                                // Let's just trust textNode.height() updates on access
                                rectNode.height(textNode.height() + spread);
                            }
                        }
                    }}
                    onTransformEnd={(e) => {
                        const node = e.target;
                        const textNode = node.findOne('Text');
                        if (textNode) {
                            onChange({
                                ...shapeProps,
                                x: node.x(),
                                y: node.y(),
                                fontSize: Math.round(textNode.fontSize()),
                                width: textNode.width(),
                                height: textNode.height(),
                                rotation: node.rotation(),
                            });
                        }
                    }}
                >
                    <Rect
                        x={-spread / 2}
                        y={-spread / 2}
                        width={(shapeProps.width || 0) + spread}
                        height={(shapeProps.height || 0) + spread}
                        fill={bg.color}
                        cornerRadius={bg.roundness || 0}
                        opacity={(bg.transparency !== undefined ? bg.transparency : 100) / 100}
                    />
                    <Text
                        {...genericProps}
                        {...effectProps}
                        {...gradientProps}
                        // x/y are 0 relative to Group
                        x={0}
                        y={0}
                        width={shapeProps.width} // Pass width to Text
                        text={textContent}
                        align={shapeProps.align || 'center'} // Default to center for backgrounds
                        draggable={false}
                        onClick={undefined}
                        onTap={undefined}
                    />
                </Group>
            );
        }
        // --- 3. STANDARD TEXT ---
        else {
            elementNode = (
                <Text
                    {...genericProps}
                    {...effectProps}
                    {...gradientProps}
                    width={shapeProps.width} // Explicitly pass width
                    text={textContent}
                    onDblClick={onStartEditing}
                    onDblTap={onStartEditing}
                    visible={!isEditing}
                    onMouseEnter={commonProps.onMouseEnter}
                    onMouseLeave={commonProps.onMouseLeave}
                    onTransform={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        node.setAttrs({
                            width: Math.max(5, node.width() * scaleX),
                            fontSize: Math.max(5, node.fontSize() * scaleY),
                            scaleX: 1,
                            scaleY: 1
                        });
                    }}
                    onTransformEnd={(e) => {
                        const node = e.target;
                        onChange({
                            ...shapeProps,
                            x: node.x(),
                            y: node.y(),
                            fontSize: Math.round(node.fontSize()),
                            width: node.width(),
                            height: node.height(),
                            rotation: node.rotation(),
                        });
                    }}
                />
            );
        }
    } else if (shapeProps.type === ELEMENT_TYPES.IMAGE) {
        if (isEditing) {
            elementNode = <ImageCropper shapeProps={shapeProps} src={shapeProps.src} onChange={onChange} />;
        } else {
            const imageProps = {
                ...commonProps,
                onDblClick: onStartEditing,
                onDblTap: onStartEditing
            };
            elementNode = <KonvaImage commonProps={imageProps} src={shapeProps.src} />;
        }
    } else if (shapeProps.type === 'circle') {
        elementNode = <Ellipse {...commonProps} radiusX={shapeProps.width / 2} radiusY={shapeProps.height / 2} />;
    } else if (shapeProps.type === 'star') {
        elementNode = (
            <Star
                {...commonProps}
                numPoints={shapeProps.numPoints || 5}
                innerRadius={(shapeProps.width / 2) * (shapeProps.innerRadiusRatio || 0.5)}
                outerRadius={shapeProps.width / 2}
            />
        );
    } else if (shapeProps.type === 'arrow') {
        elementNode = (
            <Arrow
                {...commonProps}
                points={[0, 0, shapeProps.width, 0]}
                pointerLength={10}
                pointerWidth={10}
            />
        );
    } else if (shapeProps.type === 'line') {
        elementNode = (
            <Line
                {...commonProps}
                points={[0, 0, shapeProps.width, 0]}
                strokeWidth={5}
            />
        );
    } else if (shapeProps.type === 'triangle') {
        elementNode = (
            <RegularPolygon
                {...commonProps}
                sides={3}
                radius={shapeProps.width / 2}
            />
        );
    } else if (shapeProps.type === 'polygon') {
        elementNode = (
            <RegularPolygon
                {...commonProps}
                sides={shapeProps.sides || 6}
                radius={shapeProps.width / 2}
            />
        );
    } else if (shapeProps.type === 'frame') {
        // Frame: A shape that can hold an image as a pattern fill
        const FrameShape = ({ commonProps, shapeProps }) => {
            const [patternImg] = useImage(shapeProps.fillPatternImage || '', 'anonymous');

            const frameProps = {
                ...commonProps,
                fillPatternImage: patternImg,
                fillPatternScale: shapeProps.fillPatternScale || { x: 1, y: 1 },
                fillPatternOffset: shapeProps.fillPatternOffset || { x: 0, y: 0 },
                fillPatternRepeat: 'no-repeat',
            };

            // Render based on frameShape
            switch (shapeProps.frameShape) {
                case 'circle':
                    return <Ellipse {...frameProps} radiusX={shapeProps.width / 2} radiusY={shapeProps.height / 2} />;
                case 'star':
                    return (
                        <Star
                            {...frameProps}
                            numPoints={shapeProps.numPoints || 5}
                            innerRadius={(shapeProps.width / 2) * (shapeProps.innerRadiusRatio || 0.5)}
                            outerRadius={shapeProps.width / 2}
                        />
                    );
                case 'triangle':
                    return <RegularPolygon {...frameProps} sides={3} radius={shapeProps.width / 2} />;
                case 'polygon':
                    return <RegularPolygon {...frameProps} sides={shapeProps.sides || 6} radius={shapeProps.width / 2} />;
                case 'rect':
                default:
                    return <Rect {...frameProps} cornerRadius={shapeProps.cornerRadius || 0} />;
            }
        };

        elementNode = <FrameShape commonProps={commonProps} shapeProps={shapeProps} />;
    } else {
        elementNode = <Rect {...commonProps} cornerRadius={shapeProps.cornerRadius || 0} />;
    }

    // Calculate Hover Border Coordinates using actual rendered dimensions if available
    const nodeHeight = shapeRef.current?.height ? shapeRef.current.height() : null;

    let hoverX = shapeProps.x - 2;
    let hoverY = shapeProps.y - 2;
    let hoverW = (shapeProps.width || 0) + 4;
    let hoverH = (nodeHeight || shapeProps.height || (shapeProps.type === 'text' ? (shapeProps.fontSize * (shapeProps.lineHeight || 1.1)) : 0)) + 4;

    // Offset for center-based shapes
    if (['circle', 'star', 'triangle', 'polygon'].includes(shapeProps.type)) {
        hoverX = shapeProps.x - shapeProps.width / 2 - 2;
        hoverY = shapeProps.y - (shapeProps.height || shapeProps.width) / 2 - 2;
    }

    return (
        <Group>
            {isHovered && !isSelected && !isEditing && (
                <Rect
                    x={hoverX}
                    y={hoverY}
                    width={hoverW}
                    height={hoverH}
                    rotation={shapeProps.rotation}
                    stroke="#8b3dff"
                    strokeWidth={1 / scale}
                    fill="rgba(139, 61, 255, 0.05)"
                    listening={false}
                />
            )}
            {elementNode}
        </Group>
    );
};

const hexToRgb = (hex) => {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    // Parse
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

const KonvaImage = ({ commonProps, src }) => {
    const [img] = useImage(src, 'anonymous');
    const imageRef = useRef();

    useEffect(() => {
        if (imageRef.current) {
            if (typeof commonProps.ref === 'function') commonProps.ref(imageRef.current);
            else if (commonProps.ref) commonProps.ref.current = imageRef.current;
        }
    }, [commonProps.ref]);

    useEffect(() => {
        if (img && imageRef.current) {
            imageRef.current.cache();
        }
    }, [
        img,
        commonProps.width,
        commonProps.height,
        commonProps.brightness,
        commonProps.contrast,
        commonProps.blurRadius,
        commonProps.saturation,
        commonProps.noise,
        commonProps.pixelSize,
        commonProps.cornerRadius,
        commonProps.sepia,
        commonProps.invert,
        commonProps.grayscale,
        commonProps.tintColor,
        commonProps.tintAlpha
    ]);

    const filters = useMemo(() => {
        const f = [];
        if (commonProps.brightness) f.push(Konva.Filters.Brighten);
        if (commonProps.contrast) f.push(Konva.Filters.Contrast);
        if (commonProps.blurRadius) f.push(Konva.Filters.Blur);
        if (commonProps.saturation) f.push(Konva.Filters.HSL);
        if (commonProps.noise) f.push(Konva.Filters.Noise);
        if (commonProps.pixelSize > 1) f.push(Konva.Filters.Pixelate);
        if (commonProps.sepia) f.push(Konva.Filters.Sepia);
        if (commonProps.invert) f.push(Konva.Filters.Invert);
        if (commonProps.grayscale) f.push(Konva.Filters.Grayscale);
        if (commonProps.tintColor) f.push(Konva.Filters.RGBA);
        return f;
    }, [
        commonProps.brightness,
        commonProps.contrast,
        commonProps.blurRadius,
        commonProps.saturation,
        commonProps.noise,
        commonProps.pixelSize,
        commonProps.sepia,
        commonProps.invert,
        commonProps.grayscale,
        commonProps.tintColor
    ]);

    let rgbaProps = {};
    if (commonProps.tintColor) {
        const { r, g, b } = hexToRgb(commonProps.tintColor);
        rgbaProps = {
            red: r,
            green: g,
            blue: b,
            alpha: commonProps.tintAlpha !== undefined ? commonProps.tintAlpha : 0.5
        };
    }

    const crop = commonProps.cropX !== undefined ? {
        x: commonProps.cropX,
        y: commonProps.cropY,
        width: commonProps.cropWidth,
        height: commonProps.cropHeight
    } : null;

    return (
        <Image
            image={img}
            {...commonProps}
            ref={imageRef}
            filters={filters}
            crop={crop}
            // Filter Props
            brightness={commonProps.brightness || 0}
            contrast={commonProps.contrast || 0}
            blurRadius={commonProps.blurRadius || 0}
            saturation={commonProps.saturation || 0} // HSL: 0 is normal. -1 to 1 range usually? Konva HSL saturation is -2.0 to 10.0?
            // Konva: saturation: -1 to 1?
            // My panel uses -2 to 5.
            noise={commonProps.noise || 0}
            pixelSize={commonProps.pixelSize || 1}
            // Boolean/Simple Filters
            sepia={commonProps.sepia || 0} // Konva Sepia takes nothing? or value? Docs say no param usually, or levels?
            // Actually Konva.Filters.Sepia doesn't use attrs. It just applies.
            // But some forks do. Let's assume standard Konva Sepia has no controls.
            invert={commonProps.invert || 0}
            // RGBA Tint
            {...rgbaProps}

            // Blend Mode
            globalCompositeOperation={commonProps.blendMode || 'source-over'}
        />
    );
};

import PageToolbar from './PageToolbar';

const CanvasStage = forwardRef(({ pages = [], selectedIds, onSelect, onUpdateElement, onAddElementAt, onUpload, scale = 1, onScaleChange, isHandMode, onDelete, onDuplicate, onAlign, onLayerAction, showGrid, onPageAction, onUpdatePageTitle, clipboard, onCopy, onCut, onPaste }, ref) => {
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
    const [mousePos, setMousePos] = useState({ x: null, y: null });
    const [contextMenu, setContextMenu] = useState(null);

    const allElements = pages.flatMap(p => p.elements);

    // Track stage position for toolbars
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setEditingId(null);
    }, [selectedIds]);

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
        fitToPage: () => fitToPage(),
        startEditing: (id) => onStartEditing(id)
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
            if (selectedIds.includes(id) && selectedIds.length === 1) {
                // If already selected and single selection, start editing
                const element = allElements.find(el => el.id === id);
                if (element?.type === 'text') {
                    onStartEditing(id);
                }
            } else {
                onSelect([id]);
            }
        }
        e.cancelBubble = true;
    };

    const onStartEditing = (id) => {
        const page = pages.find(p => p.elements.some(el => el.id === id));
        if (!isHandMode && !page?.locked) {
            setEditingId(id);
        }
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
        const snapThreshold = showGrid ? 10 : 5; // Larger threshold when grid is on

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

        // Snap to grid if enabled
        if (showGrid) {
            const gridSize = 50;
            const gridX = Math.round(absX / gridSize) * gridSize;
            const gridY = Math.round(absY / gridSize) * gridSize;

            if (Math.abs(absX - gridX) < snapThreshold) {
                snappedX = gridX;
                newGuides.push({ x: gridX, y: 0, width: 1 / scale, height: PAGE_HEIGHT, orientation: 'V', distance: null });
                guidesFoundX = true;
            }
            if (Math.abs(absY - gridY) < snapThreshold) {
                snappedY = gridY;
                newGuides.push({ x: 0, y: gridY, width: PAGE_WIDTH, height: 1 / scale, orientation: 'H', distance: null });
                guidesFoundY = true;
            }
        }

        others.forEach(obj => {
            const snapPointsX = [
                { guide: obj.left, item: itemBounds.left, snap: obj.left, label: 'L' },
                { guide: obj.right, item: itemBounds.right, snap: obj.right - itemWidth, label: 'R' },
                { guide: obj.centerX, item: itemBounds.centerX, snap: obj.centerX - itemWidth / 2, label: 'C' },
            ];

            snapPointsX.forEach(p => {
                if (!guidesFoundX && Math.abs(p.item - p.guide) < snapThreshold) {
                    snappedX = p.snap;
                    const distance = Math.abs(p.item - p.guide);
                    newGuides.push({
                        x: p.guide,
                        y: 0,
                        width: 1 / scale,
                        height: PAGE_HEIGHT,
                        orientation: 'V',
                        distance: distance > 0.5 ? Math.round(distance) : null
                    });
                    guidesFoundX = true;
                }
            });

            const snapPointsY = [
                { guide: obj.top, item: itemBounds.top, snap: obj.top, label: 'T' },
                { guide: obj.bottom, item: itemBounds.bottom, snap: obj.bottom - itemHeight, label: 'B' },
                { guide: obj.centerY, item: itemBounds.centerY, snap: obj.centerY - itemHeight / 2, label: 'C' },
            ];

            snapPointsY.forEach(p => {
                if (!guidesFoundY && Math.abs(p.item - p.guide) < snapThreshold) {
                    snappedY = p.snap;
                    const distance = Math.abs(p.item - p.guide);
                    newGuides.push({
                        x: 0,
                        y: p.guide,
                        width: PAGE_WIDTH,
                        height: 1 / scale,
                        orientation: 'H',
                        distance: distance > 0.5 ? Math.round(distance) : null
                    });
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

    // Track mouse position for rulers
    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setMousePos({ x: null, y: null });
    }, []);

    // Context menu handler
    const handleContextMenu = useCallback((e) => {
        e.preventDefault();

        // Get the clicked element if any
        const stage = stageRef.current;
        if (!stage) return;

        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;

        // Find if we clicked on an element
        const clickedElement = allElements.find(el => {
            const node = elementRefs.current[el.id];
            if (!node) return false;

            const box = node.getClientRect();
            return pointerPos.x >= box.x && pointerPos.x <= box.x + box.width &&
                pointerPos.y >= box.y && pointerPos.y <= box.y + box.height;
        });

        // If we clicked on an element that's not selected, select it first
        if (clickedElement && !selectedIds.includes(clickedElement.id)) {
            onSelect([clickedElement.id]);
        }

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            selection: clickedElement || (selectedIds.length > 0 ? allElements.find(el => el.id === selectedIds[0]) : null)
        });
    }, [allElements, selectedIds, onSelect]);

    return (
        <div
            className="flex-1 overflow-hidden bg-[#18191B] relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            ref={containerRef}
            onContextMenu={handleContextMenu}
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
                                                onStartEditing={() => onStartEditing(el.id)}
                                                isEditing={editingId === el.id}
                                                shapeRef={node => { elementRefs.current[el.id] = node; }}
                                                isHandMode={isHandMode || page.locked || page.hidden}
                                                scale={scale}
                                                isSelected={selectedIds.includes(el.id)}
                                            />
                                        ))}
                                    </Group>

                                    {/* Page Specific Guides with Distance Labels */}
                                    {guides.map((guide, i) => (
                                        <Group key={i}>
                                            <Line
                                                points={guide.orientation === 'V' ? [guide.x, 0, guide.x, PAGE_HEIGHT] : [0, guide.y, PAGE_WIDTH, guide.y]}
                                                stroke="#7D2AE8"
                                                strokeWidth={1 / scale}
                                                dash={[4, 4]}
                                                listening={false}
                                            />
                                            {guide.distance !== null && guide.distance !== undefined && (
                                                <Label
                                                    x={guide.orientation === 'V' ? guide.x : PAGE_WIDTH / 2}
                                                    y={guide.orientation === 'H' ? guide.y : PAGE_HEIGHT / 2}
                                                    listening={false}
                                                >
                                                    <Tag
                                                        fill="#7D2AE8"
                                                        cornerRadius={3}
                                                        pointerDirection="down"
                                                        pointerWidth={6}
                                                        pointerHeight={4}
                                                    />
                                                    <Text
                                                        text={`${guide.distance}px`}
                                                        fontSize={10 / scale}
                                                        fill="white"
                                                        padding={4 / scale}
                                                        fontFamily="monospace"
                                                        fontStyle="bold"
                                                    />
                                                </Label>
                                            )}
                                        </Group>
                                    ))}

                                    {/* Page Grid */}
                                    {showGrid && (
                                        <Group listening={false}>
                                            {Array.from({ length: Math.ceil(PAGE_WIDTH / 50) + 1 }).map((_, i) => (
                                                <Line
                                                    key={`v-${i}`}
                                                    points={[i * 50, 0, i * 50, PAGE_HEIGHT]}
                                                    stroke="rgba(139, 61, 255, 0.1)"
                                                    strokeWidth={1 / scale}
                                                />
                                            ))}
                                            {Array.from({ length: Math.ceil(PAGE_HEIGHT / 50) + 1 }).map((_, i) => (
                                                <Line
                                                    key={`h-${i}`}
                                                    points={[0, i * 50, PAGE_WIDTH, i * 50]}
                                                    stroke="rgba(139, 61, 255, 0.1)"
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
                            // Ultra-Premium Canva-style properties
                            anchorFill="white"
                            anchorStroke="#8b3dff"
                            anchorStrokeWidth={1.5}
                            anchorSize={8}
                            anchorCornerRadius={8}
                            borderStroke="#8b3dff"
                            borderStrokeWidth={1}
                            rotateAnchorOffset={40}
                            padding={0}
                            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']}
                            anchorStyleFunc={(anchor) => {
                                // Corner handles stay circular
                                if (anchor.hasName('top-left') || anchor.hasName('top-right') ||
                                    anchor.hasName('bottom-left') || anchor.hasName('bottom-right')) {
                                    anchor.cornerRadius(8);
                                    anchor.width(8);
                                    anchor.height(8);
                                    anchor.offsetX(4);
                                    anchor.offsetY(4);
                                }
                                // Side handles become "pills"
                                if (anchor.hasName('middle-left') || anchor.hasName('middle-right')) {
                                    anchor.width(4);
                                    anchor.height(20);
                                    anchor.cornerRadius(10);
                                    // Adjust offset to center the pill on the line
                                    anchor.offsetX(2);
                                    anchor.offsetY(10);
                                }
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

                {editingId && (() => {
                    const page = pages.find(p => p.elements.some(el => el.id === editingId));
                    const element = page?.elements.find(el => el.id === editingId);

                    if (!element || element.type !== 'text') return null;

                    const pageIndex = pages.indexOf(page);
                    const pageYOffset = pageIndex * (PAGE_HEIGHT + PAGE_GAP);

                    return (
                        <TextEditorOverlay
                            element={element}
                            pageYOffset={pageYOffset}
                            scale={scale}
                            stage={stageRef.current}
                            onSave={(newText) => {
                                onUpdateElement(editingId, { text: newText });
                                setEditingId(null);
                            }}
                            onCancel={() => setEditingId(null)}
                        />
                    );
                })()}
            </div>

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

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    selection={contextMenu.selection}
                    onClose={() => setContextMenu(null)}
                    onCopy={onCopy}
                    onCut={onCut}
                    onPaste={onPaste}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onLock={() => {
                        if (contextMenu.selection) {
                            onUpdateElement(contextMenu.selection.id, { locked: !contextMenu.selection.locked });
                        }
                    }}
                    onLayerAction={onLayerAction}
                    canPaste={clipboard && clipboard.length > 0}
                />
            )}
        </div>
    );
});

export default CanvasStage;

const getCSSEffectStyles = (element) => {
    if (element.type !== 'text') return {};
    const { effectType, effectParams = {} } = element;
    const styles = {};

    switch (effectType) {
        case 'shadow': {
            const rad = ((effectParams.direction || 0) - 90) * Math.PI / 180;
            const dist = (effectParams.offset || 0) / 2;
            const color = effectParams.color || 'rgba(0,0,0,0.5)';
            const ox = Math.cos(rad) * dist;
            const oy = Math.sin(rad) * dist;
            styles.textShadow = `${ox}px ${oy}px 5px ${color}`;
            break;
        }
        case 'lift': {
            const intensity = effectParams.intensity || 50;
            styles.textShadow = `0px ${intensity / 10}px ${intensity / 5}px rgba(0,0,0,0.4)`;
            break;
        }
        case 'hollow': {
            const color = element.fill || '#000000';
            styles.WebkitTextStroke = `1.2px ${color}`;
            styles.color = 'transparent';
            break;
        }
        case 'outline': {
            const color = effectParams.color || '#000000';
            styles.WebkitTextStroke = `2px ${color}`;
            styles.paintOrder = 'stroke fill';
            break;
        }
        case 'echo': {
            const rad = ((effectParams.direction || 0) - 90) * Math.PI / 180;
            const dist = (effectParams.offset || 0) / 2;
            const color = effectParams.color || 'rgba(0,0,0,0.3)';
            const ox = Math.cos(rad) * dist;
            const oy = Math.sin(rad) * dist;
            styles.textShadow = `${ox}px ${oy}px 0px ${color}`;
            break;
        }
        case 'splice': {
            const rad = ((effectParams.direction || 0) - 90) * Math.PI / 180;
            const dist = (effectParams.offset || 0) / 2;
            const color = effectParams.color || '#000000';
            const color2 = effectParams.color2 || 'rgba(0,0,0,0.5)';
            const ox = Math.cos(rad) * dist;
            const oy = Math.sin(rad) * dist;
            styles.WebkitTextStroke = `1.2px ${color}`;
            styles.textShadow = `${ox}px ${oy}px 0px ${color2}`;
            break;
        }
        case 'glitch': {
            const intensity = (effectParams.intensity || 50) / 8;
            styles.textShadow = `${intensity}px 0 0 rgba(255,0,255,0.8), ${-intensity}px 0 0 rgba(0,255,255,0.8)`;
            break;
        }
        case 'neon': {
            const color = effectParams.color || '#ff00ff';
            const intensity = (effectParams.intensity || 50);
            styles.textShadow = `0 0 ${intensity / 10}px #fff, 0 0 ${intensity / 5}px #fff, 0 0 ${intensity / 2}px ${color}, 0 0 ${intensity}px ${color}`;
            styles.color = '#ffffff';
            break;
        }
        default:
            break;
    }
    return styles;
};

const TextEditorOverlay = ({ element, onSave, onCancel, stage }) => {
    const [text, setText] = useState(element.text);
    const editorRef = useRef();
    const [style, setStyle] = useState({});

    // Calculate precise position on mount
    useEffect(() => {
        if (!stage || !element.id) return;

        const node = stage.findOne('#' + element.id);
        if (!node) return;

        // Get absolute transform
        // We need to account for Stage scale/position and Group transforms
        const tr = node.getAbsoluteTransform();
        const attrs = node.attrs;

        // Get absolute position of the top-left corner
        const absPos = node.getAbsolutePosition();

        // Get scale/rotation
        const absScale = node.getAbsoluteScale();
        const absRotation = node.getAbsoluteRotation();

        // Get Stage container position in viewport
        const stageRect = stage.container().getBoundingClientRect();

        // Compute styling
        const computedStyle = {
            position: 'absolute',
            top: stageRect.top + absPos.y + window.scrollY,
            left: stageRect.left + absPos.x + window.scrollX,
            width: (node.width() * absScale.x),
            minHeight: (node.height() * absScale.y),
            fontSize: (attrs.fontSize || 12) * absScale.y, // Assuming uniform scale mostly
            fontFamily: attrs.fontFamily || 'Inter, sans-serif',
            fontWeight: (attrs.fontWeight === 'bold' || (attrs.fontStyle && attrs.fontStyle.includes('bold'))) ? 'bold' : 'normal',
            fontStyle: (attrs.fontStyle === 'italic' || (attrs.fontStyle && attrs.fontStyle.includes('italic'))) ? 'italic' : 'normal',
            color: attrs.fill || '#000000',
            textAlign: attrs.align || 'left',
            textTransform: attrs.textTransform || 'none',
            textDecoration: attrs.textDecoration || 'none',
            letterSpacing: (attrs.letterSpacing || 0) * absScale.x,
            lineHeight: attrs.lineHeight || 1.1,
            padding: (attrs.padding || 0) * absScale.y,
            margin: 0,
            outline: '2px solid #7D2AE8', // Highlight editing area
            background: 'transparent', // Or 'rgba(255,255,255,0.9)' for visibility? Transparent matches "In-Place". 
            // But if text is white on white, might be hard? 
            // Usually users edit on the background.
            caretColor: attrs.fill || '#000000',
            zIndex: 9999,
            boxSizing: 'border-box',
            transform: `rotate(${absRotation}deg)`,
            transformOrigin: 'top left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            overflow: 'hidden',
        };

        // Adjust for "Center" or "Right" alignment visual jump?
        // Konva draws text from top-left even if aligned center (text is centered in box).
        // HTML contenteditable is same.
        // So they should align perfectly.

        setStyle(computedStyle);

        // Focus and select all
        if (editorRef.current) {
            editorRef.current.focus();
            // Select all text behaving like standard editors
            document.execCommand('selectAll', false, null);
        }
    }, [stage, element.id]);


    const handleInput = (e) => {
        setText(e.currentTarget.innerText);
    };

    const handleKeyDown = (e) => {
        // Shift+Enter for new line, Enter to save
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSave(text);
        }
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    if (!stage) return null;

    return (
        <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={() => onSave(text)}
            onKeyDown={handleKeyDown}
            style={style}
        // Use danger to set initial text to preserve newlines correctly if needed, but innerText usually works.
        >
            {element.text}
        </div>
    );
};

const ImageCropper = ({ shapeProps, src, onChange }) => {
    const [img] = useImage(src, 'anonymous');

    // Default dimensions if image not loaded or crop not set
    const cropX = shapeProps.cropX !== undefined ? shapeProps.cropX : 0;
    const cropY = shapeProps.cropY !== undefined ? shapeProps.cropY : 0;
    // Use shapeProps.cropWidth/Height if exist, or fallback to img.width/height if img loaded, or 100
    const cropW = shapeProps.cropWidth || (img ? img.width : 100);
    const cropH = shapeProps.cropHeight || (img ? img.height : 100);

    const scaleX = shapeProps.width / cropW;
    const scaleY = shapeProps.height / cropH;

    if (!img) return null;

    return (
        <Group>
            {/* The Ghost Image (Full Source Context) - Controls Positioning */}
            <Image
                image={img}
                x={-cropX * scaleX}
                y={-cropY * scaleY}
                width={img.width * scaleX}
                height={img.height * scaleY}
                opacity={0.4}
                draggable
                onDragMove={(e) => {
                    const node = e.target;
                    const newCropX = -node.x() / scaleX;
                    const newCropY = -node.y() / scaleY;

                    onChange({
                        ...shapeProps,
                        cropX: newCropX,
                        cropY: newCropY,
                        cropWidth: cropW,
                        cropHeight: cropH
                    });
                }}
            />

            {/* The Visible Result (Clear) - Visual Feedback */}
            <Image
                image={img}
                x={0}
                y={0}
                width={shapeProps.width}
                height={shapeProps.height}
                crop={{
                    x: cropX,
                    y: cropY,
                    width: cropW,
                    height: cropH
                }}
                listening={false}
            />

            {/* Crop Frame Border */}
            <Rect
                x={0}
                y={0}
                width={shapeProps.width}
                height={shapeProps.height}
                stroke="#fff"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
                shadowColor="black"
                shadowBlur={2}
            />
        </Group>
    );
};
