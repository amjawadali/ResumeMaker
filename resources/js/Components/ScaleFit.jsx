import { useState, useRef, useEffect } from 'react';

export default function ScaleFit({ children, width = 794, height = 1123, className = '' }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const parentWidth = containerRef.current.offsetWidth;
                // Calculate scale to fit width exactly
                const newScale = parentWidth / width;
                setScale(newScale);
            }
        };

        // Initial calc
        updateScale();

        // Observer for resizing
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [width]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden ${className}`}
            style={{
                // Force aspect ratio to match content to avoid layout shift
                aspectRatio: `${width}/${height}`
            }}
        >
            <div
                style={{
                    width: width,
                    height: height,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            >
                {children}
            </div>
        </div>
    );
}
