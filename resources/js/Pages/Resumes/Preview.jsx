import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import KonvaPreview from '@/Components/Editor/Canvas/KonvaPreview';
import { createKonvaModernTemplate } from '@/Utils/KonvaTemplateLoader';

export default function Preview({ resume, mode = 'preview', data }) {
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (resume.canvas_state && resume.canvas_state.elements) {
            setInitialData(resume.canvas_state);
        } else if (data) {
            const template = createKonvaModernTemplate(data.userDetail, data.experiences, data.educations, data.skills, data.certifications, data.languages);
            setInitialData(template);
        }
    }, [resume, data]);

    const PAGE_WIDTH = 595;
    const PAGE_HEIGHT = 842;

    if (!initialData) return null;

    return (
        <div className={`flex justify-center items-start ${mode === 'card' ? 'p-0 w-full h-full' : 'min-h-screen bg-gray-100 p-10'}`}>
            <Head title={`Preview - ${resume.title}`} />

            <div className={`${mode === 'card' ? 'w-full h-full' : 'bg-white shadow-2xl overflow-hidden'}`}
                style={mode !== 'card' ? { width: `${PAGE_WIDTH}px`, height: `${PAGE_HEIGHT}px` } : {}}>
                <KonvaPreview
                    elements={initialData.elements}
                    scale={mode === 'card' ? 0.25 : 1} // Approximate scale for card
                    width={PAGE_WIDTH}
                    height={PAGE_HEIGHT}
                />
            </div>
        </div>
    );
}
