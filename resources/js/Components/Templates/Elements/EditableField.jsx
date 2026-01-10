import React, { useRef, useEffect } from 'react';

export default function EditableField({
    id,
    content,
    tag = 'div',
    className = '',
    style = {},
    isEditMode = false,
    isSelected = false,
    onUpdate,
    onSelect,
    onDelete
}) {
    const contentRef = useRef(null);

    const handleBlur = (e) => {
        if (!isEditMode || !onUpdate) return;
        onUpdate(id, e.target.innerText);
    };

    const handleClick = (e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        if (onSelect) onSelect(id, tag, style);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(id);
    };

    // Drag Logic for Absolute Elements
    const handleMouseDown = (e) => {
        if (!isEditMode || style?.position !== 'absolute') return;
        // Don't trigger drag if clicking contentEditable or handle
        if (e.target.contentEditable === 'true') return;

        e.stopPropagation();
        e.preventDefault(); // Prevent text selection

        if (onSelect) onSelect(id, tag, style);

        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = parseInt(style.left || 0);
        const startTop = parseInt(style.top || 0);

        const onMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const newLeft = startLeft + dx;
            const newTop = startTop + dy;

            // Simple direct DOM update for smoothness, commit on up
            if (onUpdate && id) {
                // For now, commit directly via onUpdate (which syncs to state)
                // A better way is to debounce or use a local ref, but we have onUpdate prop which might be content update?
                // Wait, onUpdate in Modern.jsx is `handleUpdate(field, content)`. 
                // We need `onStyleUpdate`!
                // Modern.jsx only passes `onUpdate`. 
                // We need to use `window.parent.postMessage` directly or pass a new prop.
                // But `Modern.jsx` passes `onUpdate` which does `setCanvasState(..., [field]: content)`.
                // We need to update *styles*.
            }
        };

        const onMouseUp = (upEvent) => {
            const dx = upEvent.clientX - startX;
            const dy = upEvent.clientY - startY;
            if (dx === 0 && dy === 0) return; // Click, not drag

            const newStyle = {
                ...style,
                left: `${startLeft + dx}px`,
                top: `${startTop + dy}px`
            };

            // We need to bubble this up. 
            // Since EditableField doesn't have onStyleUpdate, we rely on parent window message for now?
            // Or we assume onUpdate can handle style?
            // No, onUpdate expects (field, content).

            // Dispatch event to parent window (Preview.jsx listener area?)
            // Actually Preview.jsx listens to 'UPDATE_STYLE' from *Edit.jsx*.
            // Here we are inside the iframe. We need to tell Preview.jsx to update state.
            // Preview.jsx has `handleSelect` which sends message to Edit.jsx.
            // We should send `UPDATE_STYLE` message to Edit.jsx from here?
            // YES.

            if (window.parent) {
                window.parent.postMessage({
                    type: 'UPDATE_STYLE',
                    field: id,
                    designId: id,
                    styles: newStyle,
                    save: true
                }, '*');
            }

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    // Render the content element
    const Tag = tag;

    if (!isEditMode) {
        return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: content }} />;
    }

    return (
        <div
            className={`relative group ${isSelected ? 'z-50' : 'z-10'} ${style?.position === 'absolute' ? 'cursor-move' : ''}`}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            style={style?.position === 'absolute' ? style : {}} // Apply positioning to wrapper if absolute
        >
            {/* The Editable Content */}
            <Tag
                ref={contentRef}
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={handleBlur}
                className={`${className} outline-none ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2 rounded-sm' : 'hover:outline-dashed hover:outline-1 hover:outline-indigo-500/50'}`}
                style={style?.position === 'absolute' ? { ...style, position: 'static' } : style} // If absolute, wrapper handles it
                dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Selection UI Overlay (Sibling) */}
            {isSelected && (
                <>
                    {/* Corner Handles */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-purple-500 rounded-full z-50 pointer-events-none"></div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-purple-500 rounded-full z-50 pointer-events-none"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-purple-500 rounded-full z-50 pointer-events-none"></div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-purple-500 rounded-full z-50 pointer-events-none"></div>

                    {/* Floating Menu */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-lg flex items-center p-1 gap-1 z-[60] animate-in fade-in zoom-in duration-200 select-none">
                        <button
                            onClick={handleDelete}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-red-500 transition-colors"
                            title="Delete"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="Duplicate">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors" title="More">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
