import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import KonvaEditor from '@/Components/Editor/KonvaEditor';
import { createKonvaModernTemplate } from '@/Utils/KonvaTemplateLoader';

export default function Edit({
    resume,
    user,
    userDetail,
    educations,
    experiences,
    skills,
    certifications,
    languages,
    userUploads: initialUploads
}) {
    const [resumeTitle, setResumeTitle] = useState(resume.title);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (resume.canvas_state && resume.canvas_state.elements) {
            setInitialData(resume.canvas_state);
        } else {
            const template = createKonvaModernTemplate(userDetail, experiences, educations, skills, certifications, languages);
            setInitialData(template);
        }
    }, []);

    if (!initialData) return <div className="h-screen w-screen flex items-center justify-center bg-[#0E1318] text-white">Loading Editor...</div>;

    return (
        <div className="w-screen h-screen overflow-hidden bg-white">
            <Head title={`Edit - ${resumeTitle}`} />

            <KonvaEditor
                initialData={initialData}
                resume={resume}
                userUploads={initialUploads}
            />
        </div>
    );
}
