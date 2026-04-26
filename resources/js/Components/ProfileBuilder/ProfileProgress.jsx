import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, Briefcase, Zap, Award, Languages, CheckCircle, AlertCircle } from 'lucide-react';

const SECTIONS = [
    { key: 'personal', label: 'Personal Info', icon: User, fields: ['full_name', 'email', 'phone', 'address', 'city', 'country', 'website', 'professional_summary', 'profile_photo'] },
    { key: 'experience', label: 'Experience', icon: Briefcase, countField: 'experiences' },
    { key: 'education', label: 'Education', icon: GraduationCap, countField: 'educations' },
    { key: 'skills', label: 'Skills', icon: Zap, countField: 'skills' },
    { key: 'projects', label: 'Projects', icon: Award, countField: 'projects' },
    { key: 'certifications', label: 'Certifications', icon: Award, countField: 'certifications' },
    { key: 'languages', label: 'Languages', icon: Languages, countField: 'languages' },
    { key: 'awards', label: 'Awards', icon: Award, countField: 'awards' },
    { key: 'volunteering', label: 'Volunteering', icon: Briefcase, countField: 'volunteerWorks' },
    { key: 'publications', label: 'Publications', icon: Award, countField: 'publications' },
];

export default function ProfileProgress({ userDetail, educations, experiences, skills, certifications, languages, projects, awards, volunteerWorks, publications, onSectionClick }) {
    const analysis = useMemo(() => {
        const results = {};
        let totalFields = 0;
        let filledFields = 0;

        SECTIONS.forEach(section => {
            if (section.fields) {
                const filled = section.fields.filter(f => {
                    const val = userDetail?.[f];
                    return val !== null && val !== undefined && val !== '';
                }).length;
                const total = section.fields.length;
                totalFields += total;
                filledFields += filled;
                results[section.key] = { filled, total, percent: Math.round((filled / total) * 100) };
            } else {
                const data = { experiences, educations, skills, certifications, languages, projects, awards, volunteerWorks, publications };
                const items = data[section.countField] || [];
                const filled = items.length > 0 ? 1 : 0;
                const total = 1;
                totalFields += total;
                filledFields += filled;
                results[section.key] = { filled, total, percent: filled * 100, count: items.length };
            }
        });

        const overall = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
        return { overall, sections: results };
    }, [userDetail, educations, experiences, skills, certifications, languages, projects, awards, volunteerWorks, publications]);

    const getColor = (percent) => {
        if (percent >= 80) return 'text-emerald-400';
        if (percent >= 50) return 'text-amber-400';
        return 'text-red-400';
    };

    const getBarColor = (percent) => {
        if (percent >= 80) return 'bg-emerald-500';
        if (percent >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-[#1A202C] rounded-3xl border border-white/5 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-white">Profile Strength</h3>
                    <p className="text-xs text-slate-400 mt-1">Complete your profile for better resume generation</p>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2D3748" strokeWidth="3" />
                        <motion.circle
                            cx="18" cy="18" r="15.9" fill="none"
                            stroke={analysis.overall >= 80 ? '#10B981' : analysis.overall >= 50 ? '#F59E0B' : '#EF4444'}
                            strokeWidth="3"
                            strokeDasharray={`${analysis.overall}, 100`}
                            strokeLinecap="round"
                            initial={{ strokeDasharray: '0, 100' }}
                            animate={{ strokeDasharray: `${analysis.overall}, 100` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </svg>
                    <span className={`absolute text-sm font-black ${getColor(analysis.overall)}`}>
                        {analysis.overall}%
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {SECTIONS.map((section) => {
                    const data = analysis.sections[section.key];
                    const Icon = section.icon;
                    return (
                        <button
                            key={section.key}
                            onClick={() => onSectionClick?.(section.key)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                        >
                            <div className={`p-2 rounded-lg ${data.percent >= 80 ? 'bg-emerald-500/10' : data.percent >= 50 ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                                <Icon size={16} className={getColor(data.percent)} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-white">{section.label}</span>
                                    <span className={`text-xs font-black ${getColor(data.percent)}`}>
                                        {data.percent}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${getBarColor(data.percent)}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${data.percent}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                    />
                                </div>
                                {section.countField && data.count > 0 && (
                                    <p className="text-[10px] text-slate-500 mt-1">{data.count} item{data.count !== 1 ? 's' : ''} added</p>
                                )}
                                {!section.countField && (
                                    <p className="text-[10px] text-slate-500 mt-1">{data.filled} of {data.total} fields filled</p>
                                )}
                            </div>
                            {data.percent === 100 ? (
                                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                            ) : (
                                <AlertCircle size={16} className="text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
