import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import KonvaPreview from '@/Components/Editor/Canvas/KonvaPreview';
import { createKonvaModernTemplate } from '@/Utils/KonvaTemplateLoader';

export default function Preview({ resume, mode = 'preview', data }) {
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (resume.canvas_state) {
            setInitialData(resume.canvas_state);
        } else if (data) {
            const template = createKonvaModernTemplate(data.userDetail, data.experiences, data.educations, data.skills, data.certifications, data.languages);
            setInitialData(template);
        }
    }, [resume, data]);

    const PAGE_WIDTH = 595;
    const PAGE_HEIGHT = 842;
    const PAGE_GAP = 60;

    if (!initialData) return null;

    const pages = initialData.pages || [];
    const elements = initialData.elements || [];
    const actualPagesCount = pages.length || 1;
    const totalHeight = actualPagesCount * PAGE_HEIGHT + (actualPagesCount - 1) * PAGE_GAP;

    return (
        <div className={`flex justify-center items-start ${mode === 'card' ? 'p-0 w-full h-full' : 'min-h-screen bg-gray-100 p-10 overflow-y-auto'}`}>
            <Head title={`Preview - ${resume.title}`} />

            <div className={`${mode === 'card' ? 'w-full h-full' : 'bg-white shadow-2xl overflow-hidden'}`}
                style={mode !== 'card' ? { width: `${PAGE_WIDTH}px`, minHeight: `${PAGE_HEIGHT}px` } : {}}>
                <KonvaPreview
                    pages={pages}
                    elements={elements}
                    scale={mode === 'card' ? 0.25 : 1}
                    width={PAGE_WIDTH}
                    height={PAGE_HEIGHT}
                />
            </div>
        </div>
    );
}
