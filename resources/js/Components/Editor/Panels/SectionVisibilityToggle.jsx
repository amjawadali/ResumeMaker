import React from 'react';
import { Eye, EyeOff, Layers } from 'lucide-react';

const SECTIONS = [
    { key: 'header', label: 'Header / Contact', icon: 'Contact' },
    { key: 'summary', label: 'Professional Summary', icon: 'Summary' },
    { key: 'experience', label: 'Work Experience', icon: 'Briefcase' },
    { key: 'education', label: 'Education', icon: 'GraduationCap' },
    { key: 'skills', label: 'Skills', icon: 'Zap' },
    { key: 'certifications', label: 'Certifications', icon: 'Award' },
    { key: 'languages', label: 'Languages', icon: 'Languages' },
];

export default function SectionVisibilityToggle({ canvasData, onToggleSection }) {
    if (!canvasData || !canvasData.pages) return null;

    // Collect all semantic tags present in the template
    const presentTags = new Set();
    canvasData.pages.forEach(page => {
        const collect = (elements) => {
            elements.forEach(el => {
                if (el.semantic) presentTags.add(el.semantic);
                if (el.elements) collect(el.elements);
            });
        };
        collect(page.elements);
    });

    const isSectionPresent = (section) => {
        if (section === 'header') {
            return presentTags.has('full_name') || presentTags.has('email') || presentTags.has('phone') || presentTags.has('profile_photo');
        }
        return presentTags.has(`${section}_repeater`) || presentTags.has(`${section}_name`) || presentTags.has(`${section}_school`) || presentTags.has(`${section}_company`);
    };

    const relevantSections = SECTIONS.filter(s => isSectionPresent(s.key));
    if (relevantSections.length === 0) return null;

    return (
        <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-3">
                <Layers size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Section Visibility</span>
            </div>
            <div className="space-y-1">
                {relevantSections.map(section => {
                    const isVisible = canvasData.sectionVisibility?.[section.key] !== false;
                    return (
                        <button
                            key={section.key}
                            onClick={() => onToggleSection(section.key)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                            <span className="text-xs text-slate-300">{section.label}</span>
                            {isVisible ? (
                                <Eye size={14} className="text-emerald-400" />
                            ) : (
                                <EyeOff size={14} className="text-slate-500 group-hover:text-slate-400" />
                            )}
                        </button>
                    );
                })}
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
                Toggle sections on/off to customize which parts of your profile appear in the resume.
            </p>
        </div>
    );
}
