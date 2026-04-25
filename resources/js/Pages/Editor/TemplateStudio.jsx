import React from 'react';
import KonvaEditor from '@/Components/Editor/KonvaEditor';
import { Head } from '@inertiajs/react';
import { MOCK_DEVELOPER_DATA } from '@/Utils/MockDeveloperData';

export default function TemplateStudio({ auth, initialData, template, userUploads, profile }) {
    // In Developer Mode, we use mock data to test the template's layout and semantic tags
    const developerResume = {
        id: template?.id || 0,
        title: template?.name || 'New Template Design',
        is_template: true
    };

    return (
        <>
            <Head title={`Template Studio - ${developerResume.title}`} />
            <KonvaEditor 
                initialData={initialData}
                resume={developerResume}
                userUploads={userUploads || []}
                mode="developer"
                mockData={MOCK_DEVELOPER_DATA}
                profile={profile}
            />
        </>
    );
}
