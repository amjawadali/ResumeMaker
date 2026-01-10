import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image, Group, Ellipse } from 'react-konva';
import useImage from 'use-image';

const KonvaImage = ({ shapeProps }) => {
    const [img] = useImage(shapeProps.src);
    return <Image image={img} {...shapeProps} draggable={false} />;
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_GAP = 60;

export default function KonvaPreview({ pages = [], elements = [], width = 595, height = 842, scale = 1 }) {
    // If elements are passed (old style), wrap them in a page
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
                        {page.elements.map((el, i) => {
                            if (el.type === 'text') {
                                return <Text key={el.id || i} {...el} draggable={false} />;
                            }
                            if (el.type === 'image') {
                                return <KonvaImage key={el.id || i} shapeProps={el} />;
                            }
                            if (el.type === 'rect') {
                                return <Rect key={el.id || i} {...el} draggable={false} />;
                            }
                            if (el.type === 'circle') {
                                return <Ellipse key={el.id || i} {...el} radiusX={el.width / 2} radiusY={el.height / 2} draggable={false} />;
                            }
                            return null;
                        })}
                    </Group>
                ))}
            </Layer>
        </Stage>
    );
}
