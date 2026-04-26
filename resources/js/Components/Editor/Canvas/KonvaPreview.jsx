import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image, Group, Ellipse, Arrow, Line, Star, RegularPolygon } from 'react-konva';
import useImage from 'use-image';

const KonvaImage = ({ shapeProps }) => {
    const [img] = useImage(shapeProps.src);
    if (!img) return null;
    const crop = (shapeProps.cropWidth > 0 && shapeProps.cropHeight > 0) ? {
        x: shapeProps.cropX,
        y: shapeProps.cropY,
        width: shapeProps.cropWidth,
        height: shapeProps.cropHeight
    } : null;
    return <Image image={img} {...shapeProps} crop={crop} draggable={false} />;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_GAP = 60;

const renderElement = (el, i) => {
    const key = el.id || i;
    const common = { ...el, draggable: false };
    switch (el.type) {
        case 'text': return <Text key={key} {...common} />;
        case 'image': return <KonvaImage key={key} shapeProps={el} />;
        case 'rect': return <Rect key={key} {...common} />;
        case 'circle': return <Ellipse key={key} {...common} radiusX={el.width / 2} radiusY={el.height / 2} />;
        case 'line': return <Line key={key} points={[0, 0, el.width, 0]} {...common} stroke={el.stroke || '#000'} />;
        case 'arrow': return <Arrow key={key} points={[0, 0, el.width, 0]} {...common} stroke={el.stroke || '#000'} pointerLength={10} pointerWidth={10} />;
        case 'star': return <Star key={key} {...common} numPoints={5} innerRadius={el.width / 4} outerRadius={el.width / 2} />;
        case 'triangle': return <RegularPolygon key={key} {...common} sides={3} radius={el.width / 2} />;
        case 'polygon': return <RegularPolygon key={key} {...common} sides={el.sides || 6} radius={el.width / 2} />;
        case 'group': return (
            <Group key={key} x={el.x} y={el.y} rotation={el.rotation || 0}>
                {(el.elements || []).map((child, ci) => renderElement(child, ci))}
            </Group>
        );
        default: return <Rect key={key} {...common} />;
    }
};

export default function KonvaPreview({ pages = [], elements = [], width = 595, height = 842, scale = 1 }) {
    const actualPages = pages.length > 0 ? pages : [{ id: 'default', elements: elements }];
    const totalHeight = actualPages.length * PAGE_HEIGHT + (actualPages.length - 1) * PAGE_GAP;

    return (
        <Stage
            width={width * scale}
            height={totalHeight * scale}
            scaleX={scale}
            scaleY={scale}
        >
            <Layer>
                {actualPages.map((page, index) => (
                    <Group key={page.id || index} y={index * (PAGE_HEIGHT + PAGE_GAP)}>
                        <Rect width={PAGE_WIDTH} height={PAGE_HEIGHT} fill="white" />
                        {(page.elements || []).map((el, i) => renderElement(el, i))}
                    </Group>
                ))}
            </Layer>
        </Stage>
    );
}
