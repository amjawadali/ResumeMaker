import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import Konva from 'konva';
import { Stage, Layer, Rect, Text, Image, Transformer, Line, Group, Ellipse, Star, Arrow, RegularPolygon, Label, Tag, TextPath, Path } from 'react-konva';
import useImage from 'use-image';
import ElementPopover from './ElementPopover';
import ContextMenu from './ContextMenu';
import Minimap from './Minimap';
import SnapGuides from './SnapGuides';

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

const Element = ({ shapeProps, onSelect, onChange, onDragMove, onDragEnd, onStartEditing, isEditing, shapeRef, isHandMode, scale, isSelected, isInGroup, mode, mockData }) => {
    const [isHovered, setIsHovered] = useState(false);
    let elementNode;

    // --- DEVELOPER MODE MOCK DATA OVERRIDE ---
    let displayProps = { ...shapeProps };
    if (mode === 'developer' && mockData && shapeProps.semantic) {
        const tag = shapeProps.semantic;
        const { userDetail, experiences, educations, skills } = mockData;

        // Simple Mapping
        const simpleMap = {
            'full_name': userDetail.full_name,
            'email': userDetail.email,
            'phone': userDetail.phone,
            'location': userDetail.address,
            'summary': userDetail.professional_summary,
            'position': userDetail.job_title,
            'linkedin': userDetail.linkedin,
            'website': userDetail.website,
        };

        if (simpleMap[tag] && shapeProps.type === 'text') {
            displayProps.text = simpleMap[tag];
        } else if (tag === 'profile_photo' && shapeProps.type === 'image') {
            displayProps.src = userDetail.profile_photo_url;
        }
        // Repeater fields (First item for preview)
        else if (tag === 'experience_company') displayProps.text = experiences[0].company;
        else if (tag === 'experience_title') displayProps.text = experiences[0].position;
        else if (tag === 'experience_date') displayProps.text = `${experiences[0].start_date} - ${experiences[0].end_date}`;
        else if (tag === 'education_school') displayProps.text = educations[0].school;
        else if (tag === 'education_degree') displayProps.text = educations[0].degree;
        else if (tag === 'skill_name') displayProps.text = skills[0].name;
    }
    // ------------------------------------------

    // Common props for all shapes
    const commonProps = {
        onClick: (e) => {
            if (isInGroup) return;
            if ((e.evt.ctrlKey || e.evt.metaKey) && shapeProps.link) {
                window.open(shapeProps.link, '_blank');
                return;
            }
            onSelect(e, shapeProps.id);
        },
        onTap: (e) => {
            if (isInGroup) return;
            onSelect(e, shapeProps.id);
        },
        name: 'element',
        ref: shapeRef,
        ...displayProps, // Use displayProps instead of shapeProps for visual rendering
        draggable: !isEditing && !isHandMode && !shapeProps.locked && !isInGroup, // Disable draggable if in group
        onMouseEnter: (e) => {
            if (!isEditing && !isHandMode && !shapeProps.locked && !isInGroup) {
                setIsHovered(true);
                const stage = e.target.getStage();
                if (stage) {
                    stage.container().style.cursor = 'move';
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
        },
        onChange: onChange,
        onDblClick: onStartEditing,
        onDblTap: onStartEditing
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
                        onChange={(newAttrs) => onChange({ id: child.id, ...newAttrs })}
                        // Pass other dummies
                        onDragMove={() => { }}
                        onDragEnd={() => { }}
                        onStartEditing={() => onStartEditing(child.id)}
                        isEditing={false}
                        isHandMode={isHandMode}
                        scale={scale}
                        isSelected={false}
                        mode={mode}
                        mockData={mockData}
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
                            const updates = {
                                ...shapeProps,
                                x: node.x(),
                                y: node.y(),
                                fontSize: Math.round(textNode.fontSize()),
                                width: textNode.width(),
                                height: textNode.height(),
                                rotation: node.rotation(),
                            };
                            if (shapeProps.effectType === 'textPath' && !shapeProps.data) {
                                updates.data = `M 0,${textNode.height() / 2} L ${textNode.width()},${textNode.height() / 2}`;
                            }
                            onChange(updates);
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
            const isAutoWidth = shapeProps.autoWidth === true;
            elementNode = (
                <Text
                    {...genericProps}
                    {...effectProps}
                    {...gradientProps}
                    width={isAutoWidth ? null : shapeProps.width} // Auto-width when enabled
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
                        if (isAutoWidth) {
                            // Only scale font size in auto-width mode
                            node.setAttrs({
                                fontSize: Math.max(5, node.fontSize() * scaleY),
                                scaleX: 1,
                                scaleY: 1
                            });
                        } else {
                            node.setAttrs({
                                width: Math.max(5, node.width() * scaleX),
                                fontSize: Math.max(5, node.fontSize() * scaleY),
                                scaleX: 1,
                                scaleY: 1
                            });
                        }
                    }}
                    onTransformEnd={(e) => {
                        const node = e.target;
                        onChange({
                            ...shapeProps,
                            x: node.x(),
                            y: node.y(),
                            fontSize: Math.round(node.fontSize()),
                            width: isAutoWidth ? null : node.width(),
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
            elementNode = <KonvaImage commonProps={commonProps} src={shapeProps.src} />;
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
                onTransform={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    node.setAttrs({
                        scaleX: 1,
                        scaleY: 1,
                        points: [0, 0, Math.max(5, node.width() * scaleX), 0]
                    });
                }}
                onTransformEnd={(e) => {
                    const node = e.target;
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(5, node.width() * node.scaleX()),
                        rotation: node.rotation(),
                    });
                }}
            />
        );
    } else if (shapeProps.type === 'icon') {
        elementNode = (
            <KonvaIcon
                commonProps={commonProps}
                iconName={shapeProps.iconName}
                size={shapeProps.width || 40}
                color={shapeProps.fill || '#000000'}
            />
        );
    } else if (shapeProps.type === 'line') {
        elementNode = (
            <Line
                {...commonProps}
                points={[0, 0, shapeProps.width, 0]}
                strokeWidth={5}
                onTransform={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    node.setAttrs({
                        scaleX: 1,
                        scaleY: 1,
                        points: [0, 0, Math.max(5, node.width() * scaleX), 0]
                    });
                }}
                onTransformEnd={(e) => {
                    const node = e.target;
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(5, node.width() * node.scaleX()),
                        rotation: node.rotation(),
                    });
                }}
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
    let hoverX = (shapeProps.x ?? 0) - 2;
    let hoverY = (shapeProps.y ?? 0) - 2;
    let hoverW = (shapeProps.width ?? 0) + 4;
    let hoverH = (shapeProps.height ?? (shapeProps.type === 'text' ? ((shapeProps.fontSize || 12) * (shapeProps.lineHeight || 1.1)) : 0)) + 4;

    // Use actual rendered bounding box when available (most accurate for everything)
    if (shapeRef.current && isHovered) {
        try {
            const rect = shapeRef.current.getClientRect({ relativeTo: shapeRef.current.getParent() });
            hoverX = rect.x - 2;
            hoverY = rect.y - 2;
            hoverW = rect.width + 4;
            hoverH = rect.height + 4;
        } catch (e) {
            // Fallback to existing manual calculations if it fails
        }
    }

    // Offset for center-based shapes (only if we didn't use getClientRect which already handles this)
    if (!shapeRef.current && ['circle', 'star', 'triangle', 'polygon'].includes(shapeProps.type)) {
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
                    strokeWidth={1.5 / scale}
                    dash={[4 / scale, 4 / scale]}
                    fill="rgba(139, 61, 255, 0.08)"
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

const KonvaIcon = ({ commonProps, iconName, size, color }) => {
    const getSvgPath = (name) => {
        const paths = {

            // Brand Icons
            Google: 'M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.32-2.12 4.52-1.36 1.36-3.44 2.4-6.2 2.4-4.84 0-8.68-4.04-8.68-8.92s3.84-8.92 8.68-8.92c2.6 0 4.52 1.04 5.92 2.36l2.32-2.32C18.44 1.64 15.64 0 12 0 5.48 0 0 5.48 0 12s5.48 12 12 12c3.56 0 6.24-1.2 8.36-3.32 2.2-2.2 2.84-5.32 2.84-7.76 0-.64-.04-1.28-.16-1.88h-11.04z',
            Apple: 'M12.152 6.896c-.548 0-1.711-.516-2.422-.516-1.147 0-2.233.703-2.822 1.722-1.197 2.067-.306 5.148.849 6.812.564.815 1.233 1.726 2.114 1.726.85 0 1.157-.52 2.186-.52 1.028 0 1.306.52 2.203.52.898 0 1.503-.827 2.066-1.642.651-.95.918-1.868.935-1.916-.017-.008-1.794-.69-1.811-2.73 0-1.705 1.393-2.525 1.458-2.565-.794-1.166-2.013-1.294-2.443-1.303-.021-.004-.848.112-1.313.112v0zm-1.048-1.782c.483-.585.807-1.393.807-2.193 0-.113-.016-.226-.032-.323-.742.032-1.629.492-2.145 1.1-.468.54-.87 1.354-.87 2.161 0 .129.02.25.044.347.818-.032 1.666-.468 2.196-1.092v0z',
            Amazon: 'M15.42 16.54c-1.32.76-2.93 1.15-4.82 1.15-3.41 0-5.32-1.63-5.32-4.09 0-2.84 2.45-4.05 6.64-4.05 1.12 0 1.93.08 2.79.25v-.61c0-1.07-.58-1.83-2.16-1.83-.93 0-1.93.3-2.82.8-.2.12-.4.1-.56-.07l-.68-.69c-.11-.11-.1-.31.02-.45 1.33-1.16 3.16-1.57 4.79-1.57 3.32 0 5.41 1.43 5.41 4.75v5.82c0 .88.42 1.27.76 1.61.16.16.2.35.04.53-.41.45-1.11 1.21-1.4 1.51-.12.13-.3.12-.43.01-.26-.22-.64-.53-.66-1.08v0zm-2.07-5.06c-.66-.14-1.34-.19-2.02-.19-2.44 0-3.69.58-3.69 2.05 0 1.13.78 1.83 2.19 1.83 1.69 0 2.87-.84 3.52-2.01v-1.68v0z M11 1.24c6.26.85 10.66 4.67 11.23 6.95.12.49-.44.75-.82.46-1.74-1.36-4.63-3.04-10.37-3.04-5.26 0-9.84 2.16-11.4 3.3-.41.3-.87-.19-.48-.6 1.76-1.87 5.61-7.07 11.84-7.07z',
            Microsoft: 'M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z',
            Meta: 'M23.18 5.75c-1.82-3.14-5.18-4.75-8.41-4.75-2.02 0-3.95.63-5.59 1.84a14.73 14.73 0 00-6.19 1.83C1 5.92 1 9.4 1 12s0 6.08 1.99 7.33a14.73 14.73 0 006.19 1.83c1.64 1.21 3.57 1.84 5.59 1.84 3.23 0 6.59-1.61 8.41-4.75 1.56-2.7 1.56-5.8 0-8.5zm-5.73 9.48c-1.12 1.93-3.1 3.01-4.96 3.01-1.4 0-2.61-.6-3.8-1.61-1.35-.91-2.63-1.63-4.19-1.63-1.1 0-2.12.35-2.83.69-1.1.53-1.1-2.47-1-4.69.11-.23.11-.23 1.23-.97.71-.34 1.73-.69 2.83-.69 1.56 0 2.84.72 4.19 1.63 1.19 1 2.4 1.61 3.8 1.61 1.85 0 3.83-1.08 4.96-3.01.69-1.2 1.41.04 1.41 1.66s-.72 2.86-1.41 4.69z',
            Netflix: 'M7 21V3l4 9 4-9v18h-4v-9l-4 9h-4z',
            Airbnb: 'M12 0a6 6 0 00-4 10.4V14l4 4 4-4v-3.6A6 6 0 0012 0zm0 8.5A2.5 2.5 0 1114.5 6 2.5 2.5 0 0112 8.5z',
            Spotify: 'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.4-.7.5-1.1.3-2.9-1.8-6.6-2.2-10.9-1.2-.4.1-.9-.2-1-.6s.2-.9.6-1c4.8-1.1 8.9-.6 12.1 1.4.4.2.5.7.3 1.1zm1.5-3.3c-.3.4-.8.6-1.2.3-3.3-2-8.3-2.6-12.2-1.4-.5.2-1-.1-1.2-.6s.1-1 .6-1.2c4.4-1.4 10-0.7 13.8 1.6.4.3.5.8.2 1.3zm.1-3.4c-4-2.4-10.6-2.6-14.4-1.4-0.6.2-1.3-0.2-1.5-0.8s0.2-1.3 0.8-1.5c4.4-1.4 11.7-1.1 16.3 1.6 0.5.3 0.7 1 0.4 1.5s-1.1 0.8-1.6 0.6z',
            
            // Technology Icons
            React: 'M23.32 10.22c-.97-5.26-4.55-9.39-9.35-10.47-4.8-.88-9.41 1.83-11.4 6.26-1.99 4.43-1.07 9.87 2.27 13.56 3.34 3.69 8.5 5.25 12.87 3.89 4.37-1.36 7.64-5.38 8.16-9.98.02-.18.04-.37.05-.56v-2.7zm-11.32 3.78c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z',
            Javascript: 'M0 0h24v24H0V0zm22.03 19.33c-.1-.38-.41-.75-.92-1.11-.51-.36-1.21-.52-2.01-.52-1.05 0-1.89.26-2.48.78-.34.3-.59.7-.72 1.13-.13.43-.19.86-.19 1.3 0 .44.06.87.19 1.3.13.43.38.83.72 1.13.59.52 1.43.78 2.48.78.8 0 1.5-.16 2.01-.52.51-.36.82-.73.92-1.11.1-.38.16-.76.16-1.14 0-.38-.06-.76-.16-1.14-.1-.38-.16-.76-.16-1.14z',
            Typescript: 'M0 0h24v24H0V0zm19.64 15c-1.38 0-2.36.42-3.14 1.17-.78.75-1.17 1.82-1.17 3.19 0 1.37.39 2.44 1.17 3.19.78.75 1.76 1.17 3.14 1.17s2.36-.42 3.14-1.17c.78-.75 1.17-1.82 1.17-3.19 0-1.37-.39-2.44-1.17-3.19-.78-.75-1.76-1.17-3.14-1.17zm-11.14 0V24h1.74v-7.26h2.7v-1.74H6.76z',
            Python: 'M11.97 0C9.82 0 7.74.85 6.22 2.36c-1.52 1.52-2.37 3.61-2.37 5.76V10H0v4h2.15v2.15h4v-2.15h2V14h4v-2.15h2v-2.15h2.15V4h-4V0h-0.33zM8.5 6A1.5 1.5 0 115.5 6a1.5 1.5 0 013 0zm5.15 12h-4v2.15h-2V22h4.33C14.18 24 16.26 23.15 17.78 21.64c1.52-1.52 2.37-3.61 2.37-5.76V14h-4.33v2.15h-2.15V18zm3.35-2.15A1.5 1.5 0 1118.5 20a1.5 1.5 0 01-3 0z',
            Php: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.61 13.92h-2.32l.74-3.16h-1.4l-.74 3.16H7.57l1.11-4.74h2.32l-.25 1.05h1.4l.25-1.05h2.32l-1.11 4.74zM16.5 10c1.38 0 2.5 1.12 2.5 2.5S17.88 15 16.5 15H14v-5h2.5zm0 1.58h-.9l.3 1.32h.6c.55 0 1-.45 1-1s-.45-1-1-1z',
            Node: 'M12 1L2 6.5v11L12 23l10-5.5v-11L12 1zm0 2.2l8 4.4v8.8l-8 4.4-8-4.4v-8.8l8-4.4zm0 2.2c-2.43 0-4.4 1.97-4.4 4.4s1.97 4.4 4.4 4.4 4.4-1.97 4.4-4.4-1.97-4.4-4.4-4.4zm0 1.76c1.46 0 2.64 1.18 2.64 2.64 0 1.46-1.18 2.64-2.64 2.64-1.46 0-2.64-1.18-2.64-2.64 0-1.46 1.18-2.64 2.64-2.64z',
            Docker: 'M2.15 10.9V13h2.15v-2.1H2.15zm3.1 0V13h2.15v-2.1H5.25zm3.11 0V13h2.15v-2.1H8.36zm3.11 0V13h2.15v-2.1h-2.15zm3.11 0V13h2.15v-2.1h-2.15zm-9.33-3.1V10h2.15V7.8H5.25zm3.11 0V10h2.15V7.8H8.36zm3.11 0V10h2.15V7.8h-2.15zm0-3.1V4.7h2.15V1.6h-2.15zM24 10.2c-1 .1-1.9.4-2.6.9-.7-.5-1.5-.9-2.5-1.1-.9-.2-1.9-.3-2.9-.3H0V16c0 1.1.9 2 2 2h18.2c1.1 0 2-.9 2-2 1.1-.1 2.1-.3 2.8-.7.7.4 1.3.8 2 1.3l1-1.3c-.9-.6-1.7-1.1-2.6-1.7 1.1-1.2 1.1-2.4 1.1-2.4.1-.7-.1-1.5-.5-2z',
            Aws: 'M12 2L2 22h4.5l1.6-4h7.8l1.6 4H22L12 2zm-1.1 4.5l2.4 6.3H10.7L10.9 6.5z',
            Git: 'M23.55 11.55l-11.1-11.1a1.5 1.5 0 00-2.12 0L1.55 9.2a1.5 1.5 0 000 2.12l11.1 11.1a1.5 1.5 0 002.12 0l8.78-8.78a1.5 1.5 0 000-2.09zM12 18a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4.5-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-9-5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
            Postgresql: 'M12 2c-3.1 0-5.8 1.4-7.5 4.1C2.8 8.8 2 12.3 2 15s1.2 4.6 3.1 5.9c.4.3.8.5 1.3.7.3.1.6.2 1 .3.4.1.8.1 1.2.1 4.4 0 8-3.6 8-8s-3.6-8-8-8zm0 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-8c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z',
            Mysql: 'M12 2c6.26.85 10.66 4.67 11.23 6.95.12.49-.44.75-.82.46-1.74-1.36-4.63-3.04-10.37-3.04-5.26 0-9.84 2.16-11.4 3.3-.41.3-.87-.19-.48-.6 1.76-1.87 5.61-7.07 11.84-7.07z',
            
            // Social
            Mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            Phone: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
            MapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7a3 3 0 110 6 3 3 0 010-6z',
            Globe: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
            Linkedin: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 110-4 2 2 0 010 4z',
            Github: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77 5.44 5.44 0 003.5 8.55c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22',
            Twitter: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
            Facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
            Instagram: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7.5 2h9a5.5 5.5 0 015.5 5.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z',
            Youtube: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 00-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 001.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 001.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58zM9.75 15.02V8.98l5.19 3.02z',
            Slack: 'M14.5 10c1.38 0 2.5-1.12 2.5-2.5S15.88 5 14.5 5 12 6.12 12 7.5V10h2.5zM14.5 12H12v2.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zM7.5 14.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5V14.5H7.5zM9.5 12h2.5V9.5C12 8.12 10.88 7 9.5 7S7 8.12 7 9.5s1.12 2.5 2.5 2.5z',
            Twitch: 'M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7',
            
            // UI Icons
            User: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
            Users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zm8 0a4 4 0 100-8 4 4 0 000 8zm-4 14v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2',
            UserPlus: 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M17 11h6',
            UserCheck: 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM21 12l-2 2-2-2',
            Star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
            Heart: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
            ThumbsUp: 'M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM1 9v11h4V9H1z',
            Award: 'M12 15l-3.35 2.23 1.28-3.87-3.07-2.6 3.9-.3L12 7l1.24 3.46 3.9.3-3.07 2.6 1.28 3.87L12 15z M12 5V2M12 22v-3',
            Medal: 'M8.21 13.89L7 23l5-3 5 3-1.21-9.12M15 7A3 3 0 119 7a3 3 0 016 0z',
            Crown: 'M2 20h20M7 19l-5-9 5 3 5-7 5 7 5-3-5 9z',
            Briefcase: 'M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M2 9h20v10a2 2 0 01-2 2H4a2 2 0 01-2-2V9zM2 14h20',
            GraduationCap: 'M22 10l-10-5-10 5 10 5 10-5zM6 12v5a6 6 0 0012 0v-5',
            Send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
            Share: 'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13',
            Download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
            Search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
            Bell: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h15s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
            Settings: 'M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.1a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z M12 15a3 3 0 100-6 3 3 0 000 6z',
            
            // Objects/Food/Travel
            Coffee: 'M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3',
            Pizza: 'M15 11l-5 5 M10 7l-5 5 M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 12 2 12 2s10 4.48 10 10z',
            Utensils: 'M3 2v7c0 1.1.9 2 2 2h4V2 M7 2v20 M21 15V2v0a5 5 0 00-5 5v8c0 1.1.9 2 2 2h3zM18 22V15',
            Plane: 'M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z',
            Car: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 12v4c0 .6.4 1 1 1h2 M7 17a2 2 0 100-4 2 2 0 000 4z M17 17a2 2 0 100-4 2 2 0 000 4z',
            Camera: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z',
            Music: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
            Video: 'M23 7l-7 5 7 5V7zM1 6h14a1 1 0 011 1v10a1 1 0 01-1 1H1a1 1 0 01-1-1V7a1 1 0 011-1z',
            Tv: 'M2 8a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8zM7 2l5 4 5-4',
            Gamepad: 'M18 11h2M18 15h2M15 13h2M9 13h2M11 11v4M5 11l-3 3 3 3h14l3-3-3-3H5z',

            // Arrows & Navigation
            ChevronUp: 'M18 15l-6-6-6 6',
            ChevronDown: 'M6 9l6 6 6-6',
            ChevronLeft: 'M15 18l-6-6 6-6',
            ChevronRight: 'M9 18l6-6-6-6',
            ArrowUp: 'M12 19V5M5 12l7-7 7 7',
            ArrowDown: 'M12 5v14M19 12l-7 7-7-7',
            ArrowLeft: 'M19 12H5M12 19l-7-7 7-7',
            ArrowRight: 'M5 12h14M12 5l7 7-7 7',
            Move: 'M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l3-3-3-3M19 9l3 3-3 3 M2 12h20 M12 2v20',
            ExternalLink: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3',
            
            // Business & Finance
            CreditCard: 'M1 10h22M1 4h22a2 2 0 012 2v12a2 2 0 01-2 2H1a2 2 0 01-2-2V6a2 2 0 012-2z',
            Banknote: 'M2 6h20v12H2zM12 12a3 3 0 100-6 3 3 0 000 6zM6 12h.01M18 12h.01',
            PieChart: 'M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z',
            BarChart: 'M12 20V10M18 20V4M6 20v-4',
            TrendingUp: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
            TrendingDown: 'M23 18l-9.5-9.5-5 5L1 6M17 18h6v-6',
            DollarSign: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
            EuroSign: 'M7 18a10 10 0 000-12m10 6H9M13 6h-4',
            ShoppingCart: 'M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6',
            ShoppingBag: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0',
            
            // Tools/Symbols
            Code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
            Terminal: 'M4 17l6-6-6-6M12 19h8',
            Database: 'M12 2C6.5 2 2 3.8 2 6s4.5 4 10 4 10-1.8 10-4-4.5-4-10-4zM2 6v12c0 2.2 4.5 4 10 4s10-1.8 10-4V6',
            File: 'M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9zM13 2v7h7',
            Folder: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
            Check: 'M20 6L9 17l-5-5',
            X: 'M18 6L6 18M6 6l12 12',
            Trash: 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2',
            HelpCircle: 'M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01',
            Info: 'M12 16v-4M12 8h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z',
        };
        return paths[name] || paths.Star;
    };

    const imageRef = useRef();
    const pathData = getSvgPath(iconName);

    // Determine if icon should be filled or stroked
    // These categories are typically designed as solid "filled" paths
    const fillBasedPrefixes = ['Brand-', 'Google', 'Apple', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Airbnb', 'Spotify', 'React', 'Javascript', 'Docker', 'Aws'];
    const isFilled = fillBasedPrefixes.some(prefix => iconName.startsWith(prefix)) || 
                     ['Facebook', 'Youtube', 'Postgresql', 'Mysql'].includes(iconName);

    useEffect(() => {
        if (imageRef.current) {
            if (typeof commonProps.ref === 'function') commonProps.ref(imageRef.current);
            else if (commonProps.ref) commonProps.ref.current = imageRef.current;
        }
    }, [commonProps.ref]);

    return (
        <Path
            {...commonProps}
            data={pathData}
            fill={isFilled ? (color || '#000000') : 'transparent'}
            stroke={isFilled ? 'transparent' : (color || '#000000')}
            strokeWidth={isFilled ? 0 : 2}
            lineCap="round"
            lineJoin="round"
            width={size}
            height={size}
            scaleX={size / 24}
            scaleY={size / 24}
            ref={imageRef}
        />
    );
};

const KonvaImage = ({ commonProps, src }) => {
    const [img] = useImage(src, 'anonymous');
    const imageRef = useRef();
    const groupRef = useRef();

    // Compute clip and extract positioning before hooks that depend on them
    const needsClip = commonProps.cropCircle || (commonProps.cornerRadius > 0);
    const { x, y, rotation, draggable, onDragMove, onDragEnd, onTransformEnd, onClick, onTap, onMouseEnter, onMouseLeave, opacity, ...visualProps } = commonProps;

    useEffect(() => {
        const targetNode = needsClip ? groupRef.current : imageRef.current;
        if (targetNode) {
            if (typeof commonProps.ref === 'function') commonProps.ref(targetNode);
            else if (commonProps.ref) commonProps.ref.current = targetNode;
        }
    }, [commonProps.ref, needsClip]);

    // Auto-fix aspect ratio on first load if not already fixed
    useEffect(() => {
        if (img && commonProps.id && commonProps.onChange && !commonProps.aspectFixed) {
            const currentW = commonProps.width || 200;
            const aspectRatio = img.width / img.height;
            const naturalH = currentW / aspectRatio;
            
            commonProps.onChange({
                ...commonProps,
                height: naturalH,
                aspectFixed: true // Prevent infinite loops and respect future user resizes
            });
        }
    }, [img, commonProps.id, commonProps.aspectFixed]);

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

    const crop = (commonProps.cropX !== undefined && commonProps.cropWidth > 0 && commonProps.cropHeight > 0) ? {
        x: commonProps.cropX,
        y: commonProps.cropY,
        width: commonProps.cropWidth,
        height: commonProps.cropHeight
    } : null;

    const imageElement = (
        <Image
            image={img}
            {...visualProps}
            x={!needsClip ? x : 0}
            y={!needsClip ? y : 0}
            rotation={!needsClip ? rotation : 0}
            draggable={!needsClip ? draggable : false}
            onDragMove={!needsClip ? onDragMove : undefined}
            onDragEnd={!needsClip ? onDragEnd : undefined}
            onTransformEnd={!needsClip ? onTransformEnd : undefined}
            onClick={!needsClip ? onClick : undefined}
            onTap={!needsClip ? onTap : undefined}
            onDblClick={!needsClip ? (commonProps.onDblClick || undefined) : undefined}
            onDblTap={!needsClip ? (commonProps.onDblTap || undefined) : undefined}
            onMouseEnter={!needsClip ? onMouseEnter : undefined}
            onMouseLeave={!needsClip ? onMouseLeave : undefined}
            opacity={!needsClip ? (opacity ?? 1) : 1}
            ref={imageRef}
            filters={filters}
            crop={crop}
            brightness={commonProps.brightness || 0}
            contrast={commonProps.contrast || 0}
            blurRadius={commonProps.blurRadius || 0}
            saturation={commonProps.saturation || 0}
            noise={commonProps.noise || 0}
            pixelSize={commonProps.pixelSize || 1}
            sepia={commonProps.sepia || 0}
            invert={commonProps.invert || 0}
            {...rgbaProps}
            globalCompositeOperation={commonProps.blendMode || 'source-over'}
        />
    );

    if (!needsClip) return imageElement;

    return (
        <Group
            ref={groupRef}
            x={x}
            y={y}
            rotation={rotation}
            draggable={draggable}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
            onClick={onClick}
            onTap={onTap}
            onDblClick={commonProps.onDblClick}
            onDblTap={commonProps.onDblTap}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            opacity={opacity ?? 1}
            clipFunc={(ctx) => {
                if (commonProps.cropCircle) {
                    ctx.beginPath();
                    ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
                    ctx.closePath();
                } else {
                    const r = commonProps.cornerRadius || 0;
                    ctx.beginPath();
                    ctx.moveTo(r, 0);
                    ctx.lineTo(w - r, 0);
                    ctx.quadraticCurveTo(w, 0, w, r);
                    ctx.lineTo(w, h - r);
                    ctx.quadraticCurveTo(w, h, w - r, h);
                    ctx.lineTo(r, h);
                    ctx.quadraticCurveTo(0, h, 0, h - r);
                    ctx.lineTo(0, r);
                    ctx.quadraticCurveTo(0, 0, r, 0);
                    ctx.closePath();
                }
            }}
        >
            {imageElement}
        </Group>
    );
};

import PageToolbar from './PageToolbar';

const CanvasStage = forwardRef(({ pages = [], selectedIds, onSelect, onUpdateElement, onAddElementAt, onUpload, scale = 1, onScaleChange, isHandMode, onDelete, onDuplicate, onAlign, onLayerAction, showGrid, onPageAction, onUpdatePageTitle, clipboard, onCopy, onCut, onPaste, onCopyStyle, onPasteStyle, onLink, onGroup, onUngroup, mode, mockData, pageWidth = 595, pageHeight = 842 }, ref) => {
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
    const PAGE_WIDTH = pageWidth;
    const PAGE_HEIGHT = pageHeight;
    const PAGE_GAP = 60;
    const [mousePos, setMousePos] = useState({ x: null, y: null });
    const [contextMenu, setContextMenu] = useState(null);

    // Lasso / Marquee selection state
    const [lassoRect, setLassoRect] = useState(null);
    const lassoRectRef = useRef(null);
    const lassoStartRef = useRef(null);
    const isLassoingRef = useRef(false);
    const lassoDraggedRef = useRef(false);
    const multiDragStartPos = useRef({});
    const isMultiDraggingRef = useRef(false);
    const [selectionBox, setSelectionBox] = useState(null);

    const allElements = pages.flatMap(p => p.elements);

    // Track stage position for toolbars
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setEditingId(null);
    }, [selectedIds]);

    // Track stage position for toolbars (event-driven, no polling)
    const syncStagePos = useCallback(() => {
        if (!stageRef.current) return;
        setStagePos({ x: stageRef.current.x(), y: stageRef.current.y() });
    }, []);

    useEffect(() => {
        syncStagePos();
    }, [syncStagePos, scale]); // Also sync on scale changes


    useImperativeHandle(ref, () => ({
        getStage: () => stageRef.current,
        zoomIn: () => handleManualZoom(1.1),
        zoomOut: () => handleManualZoom(1 / 1.1),
        centerPage: () => centerPage(),
        fitToPage: () => fitToPage(),
        startEditing: (id) => onStartEditing(id),
        getPointerPosition: () => {
            if (!stageRef.current) return null;
            const pointer = stageRef.current.getPointerPosition();
            if (!pointer) return null;
            // Convert to stage coordinate space (page coordinates)
            return {
                x: (pointer.x - stageRef.current.x()) / scale,
                y: (pointer.y - stageRef.current.y()) / scale,
            };
        }
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

        // Update selection box for the "Drag Anywhere" handle
        const isSingleGroup = nodes.length === 1 && allElements.find(el => el.id === selectedIds[0])?.type === 'group';
        if (nodes.length > 1 || isSingleGroup) {
            const box = trRef.current.getClientRect({ relativeTo: stageRef.current });
            setSelectionBox(box);
        } else {
            setSelectionBox(null);
        }
    }, [selectedIds, pages]);

    // Recalculate selection box whenever any element property changes to keep handle synced
    useEffect(() => {
        if (selectedIds.length > 0 && trRef.current) {
            try {
                const box = trRef.current.getClientRect({ relativeTo: stageRef.current });
                setSelectionBox(box);
            } catch (e) {
                // Ignore if rect can't be calculated yet
            }
        }
    }, [pages]);

    const handleSelect = (e, id) => {
        if (isHandMode) return;

        const isShift = e.evt.shiftKey;

        // Check if the element belongs to a hidden or locked page (search recursively for group children)
        const containsId = (elements) => elements.some(el => el.id === id || (el.type === 'group' && el.elements && containsId(el.elements)));
        const parentPage = pages.find(p => containsId(p.elements));
        if (parentPage?.hidden || parentPage?.locked) return;

        if (isShift) {
            if (selectedIds.includes(id)) {
                onSelect(selectedIds.filter(sid => sid !== id));
            } else {
                onSelect([...selectedIds, id]);
            }
        } else {
            // Double-click is required to edit text (handled by onDblClick on the Text element)
            // Single click just selects the element
            onSelect([id]);
        }
        e.cancelBubble = true;
    };

    const onStartEditing = (id) => {
        const findElement = (elements) => {
            for (const el of elements) {
                if (el.id === id) return el;
                if (el.type === 'group' && el.elements) {
                    const found = findElement(el.elements);
                    if (found) return found;
                }
            }
            return null;
        };
        const page = pages.find(p => findElement(p.elements));
        const element = findElement(page?.elements || []);
        // Allow editing text and image elements
        if (!isHandMode && !page?.locked && (element?.type === 'text' || element?.type === 'image')) {
            setEditingId(id);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const stage = stageRef.current;
        const container = containerRef.current;
        if (!stage || !container) return;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Global coordinates relative to stage (0,0) on the infinite canvas
        const stageX = (mouseX - stage.x()) / scale;
        const stageY = (mouseY - stage.y()) / scale;

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
        let dragData = null;
        try {
            const rawData = e.dataTransfer.getData('text/plain');
            if (rawData) dragData = JSON.parse(rawData);
        } catch (err) { }

        if (dragData && dragData.type) {
            const { type, payload } = dragData;
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

        // --- EQUAL SPACING GUIDES ---
        // Check for horizontal equal spacing among Y-aligned elements
        if (!guidesFoundX && pageElements.length >= 2) {
            const yAligned = pageElements
                .filter(el => !selectedIds.includes(el.id))
                .filter(el => Math.abs(el.y + el.height / 2 - (absY + itemHeight / 2)) < 30);

            if (yAligned.length >= 2) {
                const sorted = [...yAligned].sort((a, b) => a.x - b.x);
                const gaps = [];
                for (let i = 0; i < sorted.length - 1; i++) {
                    gaps.push(sorted[i + 1].x - (sorted[i].x + sorted[i].width));
                }

                // Try snapping to equal spacing before first element
                const firstGap = gaps[0];
                if (firstGap > 5) {
                    const expectedX = sorted[0].x - itemWidth - firstGap;
                    if (Math.abs(absX - expectedX) < snapThreshold) {
                        snappedX = expectedX;
                        newGuides.push({
                            x: sorted[0].x - firstGap / 2,
                            y: 0,
                            width: 1 / scale,
                            height: PAGE_HEIGHT,
                            orientation: 'V',
                            distance: null,
                            isSpacing: true
                        });
                        guidesFoundX = true;
                    }
                }

                // Try snapping to equal spacing after last element
                const lastGap = gaps[gaps.length - 1];
                if (!guidesFoundX && lastGap > 5) {
                    const expectedX = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width + lastGap;
                    if (Math.abs(absX - expectedX) < snapThreshold) {
                        snappedX = expectedX;
                        newGuides.push({
                            x: sorted[sorted.length - 1].x + sorted[sorted.length - 1].width + lastGap / 2,
                            y: 0,
                            width: 1 / scale,
                            height: PAGE_HEIGHT,
                            orientation: 'V',
                            distance: null,
                            isSpacing: true
                        });
                        guidesFoundX = true;
                    }
                }

                // Try snapping between two elements where gaps match
                if (!guidesFoundX) {
                    for (let i = 0; i < gaps.length; i++) {
                        const gap = gaps[i];
                        if (gap < 5) continue;
                        const leftX = sorted[i].x + sorted[i].width;
                        const expectedX = leftX + gap;
                        if (Math.abs(absX - expectedX) < snapThreshold) {
                            snappedX = expectedX;
                            newGuides.push({
                                x: leftX + gap / 2,
                                y: 0,
                                width: 1 / scale,
                                height: PAGE_HEIGHT,
                                orientation: 'V',
                                distance: null,
                                isSpacing: true
                            });
                            guidesFoundX = true;
                            break;
                        }
                    }
                }
            }
        }

        // Check for vertical equal spacing among X-aligned elements
        if (!guidesFoundY && pageElements.length >= 2) {
            const xAligned = pageElements
                .filter(el => !selectedIds.includes(el.id))
                .filter(el => Math.abs(el.x + el.width / 2 - (absX + itemWidth / 2)) < 30);

            if (xAligned.length >= 2) {
                const sorted = [...xAligned].sort((a, b) => a.y - b.y);
                const gaps = [];
                for (let i = 0; i < sorted.length - 1; i++) {
                    gaps.push(sorted[i + 1].y - (sorted[i].y + sorted[i].height));
                }

                // Try snapping to equal spacing before first element
                const firstGap = gaps[0];
                if (firstGap > 5) {
                    const expectedY = sorted[0].y - itemHeight - firstGap;
                    if (Math.abs(absY - expectedY) < snapThreshold) {
                        snappedY = expectedY;
                        newGuides.push({
                            x: 0,
                            y: sorted[0].y - firstGap / 2,
                            width: PAGE_WIDTH,
                            height: 1 / scale,
                            orientation: 'H',
                            distance: null,
                            isSpacing: true
                        });
                        guidesFoundY = true;
                    }
                }

                // Try snapping to equal spacing after last element
                const lastGap = gaps[gaps.length - 1];
                if (!guidesFoundY && lastGap > 5) {
                    const expectedY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height + lastGap;
                    if (Math.abs(absY - expectedY) < snapThreshold) {
                        snappedY = expectedY;
                        newGuides.push({
                            x: 0,
                            y: sorted[sorted.length - 1].y + sorted[sorted.length - 1].height + lastGap / 2,
                            width: PAGE_WIDTH,
                            height: 1 / scale,
                            orientation: 'H',
                            distance: null,
                            isSpacing: true
                        });
                        guidesFoundY = true;
                    }
                }

                // Try snapping between two elements where gaps match
                if (!guidesFoundY) {
                    for (let i = 0; i < gaps.length; i++) {
                        const gap = gaps[i];
                        if (gap < 5) continue;
                        const topY = sorted[i].y + sorted[i].height;
                        const expectedY = topY + gap;
                        if (Math.abs(absY - expectedY) < snapThreshold) {
                            snappedY = expectedY;
                            newGuides.push({
                                x: 0,
                                y: topY + gap / 2,
                                width: PAGE_WIDTH,
                                height: 1 / scale,
                                orientation: 'H',
                                distance: null,
                                isSpacing: true
                            });
                            guidesFoundY = true;
                            break;
                        }
                    }
                }
            }
        }

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

    // --- LASSO / MARQUEE SELECTION ---
    const handleMouseDown = (e) => {
        if (isHandMode || editingId) return;
        const stage = e.target.getStage();
        
        // Only start lasso if clicking on empty stage or page background (not on an actual draggable element)
        const isElement = e.target.findAncestor('.element', true);
        if (isElement) return;

        // If clicking on the selection box itself, don't restart lasso (transformer handles it usually, but just in case)
        if (e.target.getParent()?.className === 'Transformer') return;

        // MULTI-DRAG START: Handled by the invisible Rect handle for better feedback

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const stageX = (pointer.x - stage.x()) / scale;
        const stageY = (pointer.y - stage.y()) / scale;

        lassoStartRef.current = { x: stageX, y: stageY };
        isLassoingRef.current = true;
        lassoDraggedRef.current = false;
        setLassoRect({ x: stageX, y: stageY, width: 0, height: 0 });
    };

    const handleLassoMouseMove = (e) => {
        if (!isLassoingRef.current || !lassoStartRef.current) return;
        const stage = e.target.getStage();
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const currentX = (pointer.x - stage.x()) / scale;
        const currentY = (pointer.y - stage.y()) / scale;
        const start = lassoStartRef.current;

        const x = Math.min(start.x, currentX);
        const y = Math.min(start.y, currentY);
        const width = Math.abs(currentX - start.x);
        const height = Math.abs(currentY - start.y);
        
        if (width > 5 || height > 5) {
            lassoDraggedRef.current = true;
        }

        const newRect = { x, y, width, height };
        lassoRectRef.current = newRect;
        setLassoRect(newRect);

        // REAL-TIME SELECTION: Highlight items while dragging
        const selected = [];
        pages.forEach((page, pageIdx) => {
            if (page.hidden || page.locked) return;
            const pageOffsetY = pageIdx * (PAGE_HEIGHT + PAGE_GAP);
            
            page.elements.forEach(el => {
                const node = elementRefs.current[el.id];
                let box;
                if (node) {
                    try { box = node.getClientRect({ relativeTo: stage }); } 
                    catch (err) { box = { x: el.x, y: el.y + pageOffsetY, width: el.width || 50, height: el.height || 50 }; }
                } else {
                    box = { x: el.x, y: el.y + pageOffsetY, width: el.width || 50, height: el.height || 50 };
                }

                if (
                    box.x < newRect.x + newRect.width &&
                    box.x + box.width > newRect.x &&
                    box.y < newRect.y + newRect.height &&
                    box.y + box.height > newRect.y
                ) {
                    selected.push(el.id);
                }
            });
        });
        
        // Only trigger update if selection actually changed to avoid unnecessary re-renders
        if (JSON.stringify(selected) !== JSON.stringify(selectedIds)) {
            onSelect(selected);
        }
    };

    const handleMouseUp = (e) => {
        if (!isLassoingRef.current || !lassoStartRef.current) {
            isLassoingRef.current = false;
            return;
        }

        const lasso = lassoRectRef.current;
        isLassoingRef.current = false;
        lassoStartRef.current = null;
        lassoRectRef.current = null;
        setLassoRect(null);

        if (!lasso || lasso.width < 5 || lasso.height < 5) {
            // Tiny drag = click, already handled by onClick
            return;
        }

        // Find all elements intersecting with lasso rect
        const stage = stageRef.current;
        const selected = [];
        pages.forEach((page, pageIdx) => {
            if (page.hidden || page.locked) return;
            const pageOffsetY = pageIdx * (PAGE_HEIGHT + PAGE_GAP);
            
            page.elements.forEach(el => {
                const node = elementRefs.current[el.id];
                let box;
                
                if (node) {
                    try {
                        box = node.getClientRect({ relativeTo: stage });
                    } catch (err) {
                        box = { x: el.x, y: el.y + pageOffsetY, width: el.width || 50, height: el.height || 50 };
                    }
                } else {
                    box = { x: el.x, y: el.y + pageOffsetY, width: el.width || 50, height: el.height || 50 };
                }

                if (
                    box.x < lasso.x + lasso.width &&
                    box.x + box.width > lasso.x &&
                    box.y < lasso.y + lasso.height &&
                    box.y + box.height > lasso.y
                ) {
                    selected.push(el.id);
                }
            });
        });

        if (selected.length > 0) {
            onSelect(selected);
        } else {
            onSelect([]);
        }
    };

    const handleElementDragStart = (e, id) => {
        if (!selectedIds.includes(id)) {
            onSelect([id]);
        }
        
        const starts = {};
        const currentSelection = selectedIds.includes(id) ? selectedIds : [id];
        currentSelection.forEach(selId => {
            const node = elementRefs.current[selId];
            if (node) {
                starts[selId] = { x: node.x(), y: node.y() };
            }
        });
        multiDragStartPos.current = starts;
    };

    const handleElementDragMove = (e, id) => {
        const node = e.target;
        const start = multiDragStartPos.current[id];
        if (!start) return;

        const dx = node.x() - start.x;
        const dy = node.y() - start.y;

        Object.keys(multiDragStartPos.current).forEach(selId => {
            if (selId === id) return;
            const otherNode = elementRefs.current[selId];
            if (otherNode) {
                const otherStart = multiDragStartPos.current[selId];
                otherNode.setAttrs({
                    x: otherStart.x + dx,
                    y: otherStart.y + dy
                });
            }
        });
    };

    const handleElementDragEnd = () => {
        const updates = {};
        Object.keys(multiDragStartPos.current).forEach(id => {
            const node = elementRefs.current[id];
            if (node) {
                updates[id] = {
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation()
                };
            }
        });

        // Batch update
        Object.entries(updates).forEach(([id, attrs]) => {
            onUpdateElement(id, attrs);
        });

        // Refresh selection box
        if (trRef.current) {
            setSelectionBox(trRef.current.getClientRect({ relativeTo: stageRef.current }));
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
    }, [selectedIds, pages, scale, dimensions, editingId, stageRef, stagePos]); // Dependencies include stagePos to move with it

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

        // Find if we clicked on an element (using intersectsPoint for rotated shapes)
        const clickedElement = allElements.find(el => {
            const node = elementRefs.current[el.id];
            if (!node) return false;
            return node.intersectsPoint(pointerPos);
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
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={handleDrop}
            ref={containerRef}
            onContextMenu={handleContextMenu}
        >
            <div className={`w-full h-full relative transition-opacity duration-500 ${isInitialized ? 'opacity-100' : 'opacity-0'} ${isHandMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >

                {/* Rulers Overlay */}
                <Rulers
                    scale={scale}
                    stagePos={stagePos}
                    pageWidth={PAGE_WIDTH}
                    pageHeight={PAGE_HEIGHT}
                    pageCount={pages.length}
                    pageGap={PAGE_GAP}
                />

                <Stage
                    width={dimensions.width || window.innerWidth}
                    height={dimensions.height || window.innerHeight}
                    scaleX={scale}
                    scaleY={scale}
                    draggable={isHandMode}
                    onClick={(e) => {
                        if (isHandMode) return;
                        
                        // If we just finished a lasso drag, don't trigger the click-to-clear logic
                        if (lassoDraggedRef.current) {
                            lassoDraggedRef.current = false;
                            return;
                        }

                        const clickedOnEmpty = e.target === e.target.getStage();
                        if (clickedOnEmpty) onSelect([]);
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleLassoMouseMove}
                    onMouseUp={handleMouseUp}
                    onWheel={(e) => {
                        handleWheel(e);
                        syncStagePos();
                    }}
                    onDragMove={syncStagePos}
                    onDragEnd={syncStagePos}
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
                                    <PageBackground
                                        page={page}
                                        width={PAGE_WIDTH}
                                        height={PAGE_HEIGHT}
                                    />
                                    <Rect
                                        x={0} y={0} width={PAGE_WIDTH} height={PAGE_HEIGHT}
                                        fill="transparent"
                                        name="page-background"
                                        onClick={(e) => {
                                            if (isHandMode || page.locked) return;
                                            // If we just finished a lasso drag, don't trigger the click-to-clear logic
                                            if (lassoDraggedRef.current) {
                                                lassoDraggedRef.current = false;
                                                return;
                                            }
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
                                                onDragStart={(e) => handleElementDragStart(e, el.id)}
                                                onDragMove={(e) => handleElementDragMove(e, el.id)}
                                                onDragEnd={handleElementDragEnd}
                                                onStartEditing={() => onStartEditing(el.id)}
                                                isEditing={editingId === el.id}
                                                shapeRef={node => { elementRefs.current[el.id] = node; }}
                                                isHandMode={isHandMode || page.locked || page.hidden}
                                                scale={scale}
                                                isSelected={selectedIds.includes(el.id)}
                                                mode={mode}
                                                mockData={mockData}
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

                        {/* Lasso Selection Rectangle */}
                        {lassoRect && (
                            <Rect
                                x={lassoRect.x}
                                y={lassoRect.y}
                                width={lassoRect.width}
                                height={lassoRect.height}
                                fill="rgba(139, 61, 255, 0.1)"
                                stroke="#8b3dff"
                                strokeWidth={1 / scale}
                                dash={[4, 4]}
                                listening={false}
                            />
                        )}

                        {/* Multi-Drag Handle Rect (Allows dragging by clicking the empty space of a selection) */}
                        {selectionBox && (selectedIds.length > 1 || (selectedIds.length === 1 && allElements.find(el => el.id === selectedIds[0])?.type === 'group')) && (
                            <Rect
                                {...selectionBox}
                                draggable
                                fill="rgba(0,0,0,0)" // Transparent but hit-testable
                                name="multi-drag-handle"
                                onMouseEnter={(e) => { e.target.getStage().container().style.cursor = 'move'; }}
                                onMouseLeave={(e) => { e.target.getStage().container().style.cursor = 'default'; }}
                                onDragStart={(e) => {
                                    const starts = {};
                                    selectedIds.forEach(id => {
                                        const node = elementRefs.current[id];
                                        if (node) starts[id] = { x: node.x(), y: node.y() };
                                    });
                                    multiDragStartPos.current = {
                                        handle: { x: e.target.x(), y: e.target.y() },
                                        ...starts
                                    };
                                }}
                                onDragMove={(e) => {
                                    const node = e.target;
                                    const start = multiDragStartPos.current.handle;
                                    const dx = node.x() - start.x;
                                    const dy = node.y() - start.y;

                                    selectedIds.forEach(id => {
                                        const otherNode = elementRefs.current[id];
                                        const otherStart = multiDragStartPos.current[id];
                                        if (otherNode && otherStart) {
                                            otherNode.setAttrs({
                                                x: otherStart.x + dx,
                                                y: otherStart.y + dy
                                            });
                                        }
                                    });
                                }}
                                onDragEnd={(e) => {
                                    handleElementDragEnd();
                                    // Reset handle position for next drag
                                    e.target.setAttrs({ x: selectionBox.x, y: selectionBox.y });
                                }}
                                // Propagate common click events so we don't block selection changes
                                onClick={(e) => {
                                    // Find if there's an element directly under the mouse (ignoring handle)
                                    const stage = e.target.getStage();
                                    const pos = stage.getPointerPosition();
                                    e.target.listening(false);
                                    const clickedNode = stage.getIntersection(pos);
                                    e.target.listening(true);
                                    
                                    if (clickedNode && clickedNode !== e.target) {
                                        clickedNode.fire('click', e, true);
                                    } else {
                                        onSelect([]);
                                    }
                                }}
                            />
                        )}

                        {/* Global Transformer */}
                        <Transformer
                            ref={trRef}
                            flipEnabled={false}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
                                return newBox;
                            }}
                            keepRatio={(oldBox, newBox, event) => {
                                // Canva behavior: proportional by default, Shift for free-form
                                return !event.shiftKey;
                            }}
                            onTransform={(e) => {
                                // Update selection handle in real-time while resizing
                                if (trRef.current) {
                                    setSelectionBox(trRef.current.getClientRect({ relativeTo: stageRef.current }));
                                }
                            }}
                            onTransformEnd={(e) => {
                                const nodes = trRef.current.nodes();
                                nodes.forEach(node => {
                                    const id = Object.keys(elementRefs.current).find(key => elementRefs.current[key] === node);
                                    if (id) {
                                        // Reset scale and apply to width/height for clean state
                                        const scaleX = node.scaleX();
                                        const scaleY = node.scaleY();
                                        
                                        const newAttrs = {
                                            x: node.x(),
                                            y: node.y(),
                                            width: Math.max(5, node.width() * scaleX),
                                            height: Math.max(5, node.height() * scaleY),
                                            rotation: node.rotation(),
                                            scaleX: 1,
                                            scaleY: 1
                                        };
                                        
                                        node.setAttrs(newAttrs);
                                        onUpdateElement(id, newAttrs);
                                    }
                                });
                                // Refresh handle one last time
                                if (trRef.current) {
                                    setSelectionBox(trRef.current.getClientRect({ relativeTo: stageRef.current }));
                                }
                            }}
                            centeredScaling={false}
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

                        {/* Smart Snap Guides */}
                        {pages.map((page) => (
                            <Group key={`guides-${page.id}`} x={0} y={0}>
                                <SnapGuides
                                    stageWidth={PAGE_WIDTH}
                                    stageHeight={PAGE_HEIGHT}
                                    elements={page.elements}
                                    selectedIds={selectedIds}
                                />
                            </Group>
                        ))}
                    </Layer>
                </Stage>

                {/* Minimap Overview */}
                {isInitialized && (
                    <Minimap
                        pages={pages}
                        scale={scale}
                        stagePos={stagePos}
                        pageWidth={PAGE_WIDTH}
                        pageHeight={PAGE_HEIGHT}
                        pageGap={PAGE_GAP}
                        containerWidth={dimensions.width}
                        containerHeight={dimensions.height}
                        onNavigate={(pageIndex) => {
                            const stage = stageRef.current;
                            if (!stage) return;
                            const targetY = pageIndex * (PAGE_HEIGHT + PAGE_GAP);
                            const newY = -targetY * scale + dimensions.height / 2 - (PAGE_HEIGHT * scale / 2);
                            stage.y(newY);
                            stage.batchDraw();
                            syncStagePos();
                        }}
                    />
                )}

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
                    const findElement = (elements) => {
                        for (const el of elements) {
                            if (el.id === editingId) return el;
                            if (el.type === 'group' && el.elements) {
                                const found = findElement(el.elements);
                                if (found) return found;
                            }
                        }
                        return null;
                    };
                    const page = pages.find(p => findElement(p.elements));
                    const element = findElement(page?.elements || []);

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
                    onCopyStyle={onCopyStyle}
                    onPasteStyle={onPasteStyle}
                    onLink={onLink}
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
                    onGroup={onGroup}
                    onUngroup={onUngroup}
                    canGroup={selectedIds.length > 1}
                    canUngroup={selectedIds.length === 1 && allElements.find(el => el.id === selectedIds[0])?.type === 'group'}
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

        // Use client rect for accurate DOM pixel positioning
        const clientRect = node.getClientRect({ skipTransform: false });
        const attrs = node.attrs;

        // Get scale/rotation
        const absScale = node.getAbsoluteScale();
        const absRotation = node.getAbsoluteRotation();

        // Get Stage container position in viewport
        const stageRect = stage.container().getBoundingClientRect();

        // Compute styling
        const computedStyle = {
            position: 'fixed',
            top: stageRect.top + clientRect.y,
            left: stageRect.left + clientRect.x,
            width: clientRect.width,
            minHeight: clientRect.height,
            fontSize: (attrs.fontSize || 12) * absScale.y,
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
            editorRef.current.innerText = element.text;
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

    const scaleX = cropW > 0 ? shapeProps.width / cropW : 1;
    const scaleY = cropH > 0 ? shapeProps.height / cropH : 1;

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
            {shapeProps.cropCircle ? (
                <Ellipse
                    x={shapeProps.width / 2}
                    y={shapeProps.height / 2}
                    radiusX={shapeProps.width / 2}
                    radiusY={shapeProps.height / 2}
                    stroke="#fff"
                    strokeWidth={1}
                    dash={[4, 4]}
                    listening={false}
                    shadowColor="black"
                    shadowBlur={2}
                />
            ) : (
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
            )}
        </Group>
    );
};

const Rulers = ({ scale, stagePos, pageWidth, pageHeight, pageCount, pageGap }) => {
    const totalHeight = pageCount * (pageHeight + pageGap) - pageGap;

    // Determine tick spacing based on zoom level
    let tickSpacing = 50;
    let labelSpacing = 100;
    if (scale >= 2) { tickSpacing = 10; labelSpacing = 50; }
    else if (scale >= 1) { tickSpacing = 25; labelSpacing = 100; }
    else if (scale >= 0.5) { tickSpacing = 50; labelSpacing = 100; }
    else { tickSpacing = 100; labelSpacing = 200; }

    const visibleX = -stagePos.x;
    const visibleY = -stagePos.y;

    const hStart = Math.max(0, Math.floor(visibleX / scale / tickSpacing) * tickSpacing);
    const hEnd = hStart + (pageWidth / scale) + tickSpacing * 2;

    const vStart = Math.max(0, Math.floor(visibleY / scale / tickSpacing) * tickSpacing);
    const vEnd = vStart + (totalHeight / scale) + tickSpacing * 2;

    const hTicks = [];
    for (let x = hStart; x <= hEnd; x += tickSpacing) {
        if (x > pageWidth + 10) break;
        const isMajor = x % labelSpacing === 0;
        const pos = x * scale + stagePos.x;
        hTicks.push(
            <div key={`h-${x}`} className="absolute top-0 flex flex-col items-center" style={{ left: pos, transform: 'translateX(-50%)' }}>
                <div className="w-px bg-white/20" style={{ height: isMajor ? 12 : 6 }} />
                {isMajor && <span className="text-[9px] text-white/40 mt-0.5 font-mono">{x}</span>}
            </div>
        );
    }

    const vTicks = [];
    for (let y = vStart; y <= vEnd; y += tickSpacing) {
        if (y > totalHeight + 10) break;
        const isMajor = y % labelSpacing === 0;
        const pos = y * scale + stagePos.y;
        vTicks.push(
            <div key={`v-${y}`} className="absolute left-0 flex items-center" style={{ top: pos, transform: 'translateY(-50%)' }}>
                <div className="h-px bg-white/20" style={{ width: isMajor ? 12 : 6 }} />
                {isMajor && <span className="text-[9px] text-white/40 ml-1 font-mono">{y}</span>}
            </div>
        );
    }

    return (
        <>
            {/* Horizontal Ruler */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-[#18191B]/80 backdrop-blur-sm border-b border-white/5 z-20 overflow-hidden pointer-events-none">
                {hTicks}
            </div>
            {/* Vertical Ruler */}
            <div className="absolute top-6 left-0 bottom-0 w-8 bg-[#18191B]/80 backdrop-blur-sm border-r border-white/5 z-20 overflow-hidden pointer-events-none">
                {vTicks}
            </div>
        </>
    );
};

const PageBackground = ({ page, width, height }) => {
    const [bgImage] = useImage(page?.backgroundImage || '', 'anonymous');

    // Calculate background Image dimensions to "cover" the page
    let imageProps = {};
    if (bgImage) {
        const imageRatio = bgImage.width / bgImage.height;
        const pageRatio = width / height;

        if (imageRatio > pageRatio) {
            // Image is wider than page
            const newWidth = height * imageRatio;
            imageProps = {
                width: newWidth,
                height: height,
                x: (width - newWidth) / 2,
                y: 0
            };
        } else {
            // Image is taller than page
            const newHeight = width / imageRatio;
            imageProps = {
                width: width,
                height: newHeight,
                x: 0,
                y: (height - newHeight) / 2
            };
        }
    }

    return (
        <Group>
            {/* Always render a base layer (Color or Gradient) */}
            {page?.backgroundGradient ? (
                <Rect
                    x={0} y={0} width={width} height={height}
                    {...getGradientProps(
                        { fillType: 'gradient', gradientParams: page.backgroundGradient },
                        width,
                        height
                    )}
                    shadowColor="black" shadowBlur={20} shadowOpacity={0.1}
                />
            ) : (
                <Rect
                    x={0} y={0} width={width} height={height}
                    fill={page?.backgroundColor || 'white'}
                    shadowColor="black" shadowBlur={20} shadowOpacity={0.1}
                />
            )}

            {/* Render Image overlay if exists */}
            {page?.backgroundImage && bgImage && (
                <Group clip={{ x: 0, y: 0, width, height }}>
                    <Image
                        {...imageProps}
                        image={bgImage}
                        listening={false}
                    />
                </Group>
            )}
        </Group>
    );
};
