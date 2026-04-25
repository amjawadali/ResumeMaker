import React from 'react';
import { Tag, User, Briefcase, GraduationCap, Code, Link as LinkIcon, MapPin, Mail, Phone, Image as ImageIcon } from 'lucide-react';

const SEMANTIC_GROUPS = [
    {
        label: 'Personal Info',
        icon: User,
        fields: [
            { id: 'full_name', label: 'Full Name', icon: User },
            { id: 'email', label: 'Email Address', icon: Mail },
            { id: 'phone', label: 'Phone Number', icon: Phone },
            { id: 'location', label: 'Location/Address', icon: MapPin },
            { id: 'summary', label: 'Professional Summary', icon: Tag },
            { id: 'profile_photo', label: 'Profile Photo', icon: ImageIcon, type: 'image' },
        ]
    },
    {
        label: 'Professional',
        icon: Briefcase,
        fields: [
            { id: 'position', label: 'Current Job Title', icon: Briefcase },
            { id: 'experience_repeater', label: 'EXPERIENCE BLOCK (Repeater)', icon: Briefcase, type: 'group' },
            { id: 'experience_company', label: 'Experience: Company', icon: Briefcase },
            { id: 'experience_title', label: 'Experience: Title', icon: Briefcase },
            { id: 'experience_date', label: 'Experience: Date', icon: Tag },
        ]
    },
    {
        label: 'Education',
        icon: GraduationCap,
        fields: [
            { id: 'education_repeater', label: 'EDUCATION BLOCK (Repeater)', icon: GraduationCap, type: 'group' },
            { id: 'education_degree', label: 'Degree Name', icon: GraduationCap },
            { id: 'education_school', label: 'School/University', icon: Tag },
            { id: 'education_date', label: 'Education: Date', icon: Tag },
        ]
    },
    {
        label: 'Skills & Socials',
        icon: Code,
        fields: [
            { id: 'skill_name', label: 'Skill Name', icon: Code },
            { id: 'linkedin', label: 'LinkedIn URL', icon: LinkIcon },
            { id: 'website', label: 'Portfolio/Website', icon: LinkIcon },
        ]
    }
];

export default function SemanticTagDropdown({ value, onChange, elementType = 'text' }) {
    return (
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
                <Tag size={16} className="text-[#7D2AE8]" />
                <span className="text-sm font-bold text-slate-700">Semantic Mapping</span>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                Tag this element to automatically fill it with user profile data when this template is used.
            </p>

            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full text-sm border-slate-200 rounded-lg focus:ring-[#7D2AE8] focus:border-[#7D2AE8] bg-white transition-all shadow-sm"
            >
                <option value="">No Mapping (Static Content)</option>
                {SEMANTIC_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                        {group.fields
                            .filter(field => (elementType === 'image' ? field.type === 'image' : field.type !== 'image'))
                            .map((field) => (
                                <option key={field.id} value={field.id}>
                                    {field.label}
                                </option>
                            ))
                        }
                    </optgroup>
                ))}
            </select>

            {value && (
                <div className="flex items-center gap-2 mt-2 px-2 py-1.5 bg-green-50 border border-green-100 rounded-md">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-green-700 uppercase">Tagged: {value.replace('_', ' ')}</span>
                </div>
            )}
        </div>
    );
}
