import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image } from 'react-konva';
import useImage from 'use-image';

const KonvaImage = ({ shapeProps }) => {
    const [img] = useImage(shapeProps.src);
    return <Image image={img} {...shapeProps} draggable={false} />;
};

export default function KonvaPreview({ elements, width = 595, height = 842, scale = 1 }) {
    return (
        <Stage
            width={width * scale}
            height={height * scale}
            scaleX={scale}
            scaleY={scale}
        >
            <Layer>
                {elements.map((el, i) => {
                    if (el.type === 'text') {
                        return <Text key={el.id || i} {...el} draggable={false} />;
                    }
                    if (el.type === 'image') {
                        return <KonvaImage key={el.id || i} shapeProps={el} />;
                    }
                    if (el.type === 'rect') {
                        return <Rect key={el.id || i} {...el} draggable={false} />;
                    }
                    return null;
                })}
            </Layer>
        </Stage>
    );
}
