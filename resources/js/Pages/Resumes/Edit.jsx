import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import KonvaEditor from '@/Components/Editor/KonvaEditor';
import { createPremiumTemplate } from '@/Utils/KonvaTemplateLoader';

export default function Edit({
    resume,
    user,
    profile,
    userUploads: initialUploads
}) {
    const [resumeTitle, setResumeTitle] = useState(resume.title);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        // Support both old 'elements' format and new multi-page 'pages' format
        if (resume.canvas_state && (resume.canvas_state.pages || resume.canvas_state.elements)) {
            setInitialData(resume.canvas_state);
        } else {
            const template = createPremiumTemplate(
                profile.userDetail, 
                profile.experiences, 
                profile.educations, 
                profile.skills, 
                profile.certifications, 
                profile.languages, 
                profile.projects
            );
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
                profile={profile}
            />
        </div>
    );
}
