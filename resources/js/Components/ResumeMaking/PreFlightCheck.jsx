import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, X, Sparkles, ArrowRight, User, GraduationCap, Briefcase, Zap, Award, Languages } from 'lucide-react';
import FillScorer from '@/Utils/FillScorer';

const SECTION_ICONS = {
    personal: User,
    education: GraduationCap,
    experience: Briefcase,
    skills: Zap,
    certifications: Award,
    languages: Languages,
};

const TAG_SECTION_MAP = {
    full_name: 'personal', email: 'personal', phone: 'personal', location: 'personal',
    summary: 'personal', profile_photo: 'personal', position: 'personal',
    linkedin: 'personal', website: 'personal',
    experience_repeater: 'experience',
    experience_company: 'experience', experience_title: 'experience', experience_date: 'experience',
    education_repeater: 'education',
    education_degree: 'education', education_school: 'education', education_date: 'education',
    skill_name: 'skills',
};

export default function PreFlightCheck({ isOpen, onClose, template, profile, onProceed }) {
    const [activeInlineTab, setActiveInlineTab] = useState(null);

    const analysis = useMemo(() => {
        if (!template?.canvas_data || !profile) {
            return { score: 0, missing: [], sections: {} };
        }
        const result = FillScorer.analyze(template.canvas_data, profile);

        // Group missing fields by section
        const sections = {};
        result.missing.forEach(tag => {
            const section = TAG_SECTION_MAP[tag] || 'personal';
            if (!sections[section]) sections[section] = [];
            sections[section].push(tag);
        });

        return { ...result, sections };
    }, [template, profile]);

    if (!isOpen) return null;

    const canProceed = analysis.score >= 50;
    const missingCount = analysis.missing.length;

    const getTagLabel = (tag) => {
        const labels = {
            full_name: 'Full Name', email: 'Email', phone: 'Phone Number',
            location: 'Location/Address', summary: 'Professional Summary',
            profile_photo: 'Profile Photo', position: 'Job Title',
            linkedin: 'LinkedIn', website: 'Website',
            experience_repeater: 'Work Experience', experience_company: 'Company Name',
            experience_title: 'Job Title', experience_date: 'Employment Dates',
            education_repeater: 'Education History', education_degree: 'Degree',
            education_school: 'School/University', education_date: 'Study Dates',
            skill_name: 'Skills',
        };
        return labels[tag] || tag.replace(/_/g, ' ');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-[#1A202C] rounded-3xl border border-white/10 max-w-lg w-full shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                        <Sparkles size={20} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white">Content Check</h3>
                                        <p className="text-xs text-slate-400">Before we build your resume</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                    <X size={18} className="text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className={`text-3xl font-black ${analysis.score >= 80 ? 'text-emerald-400' : analysis.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {analysis.score}%
                                </div>
                                <div className="flex-1">
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${analysis.score >= 80 ? 'bg-emerald-500' : analysis.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${analysis.score}%` }}
                                            transition={{ duration: 0.8 }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1.5">
                                        {analysis.score >= 80
                                            ? 'Great! Your profile data will fill most of this template.'
                                            : analysis.score >= 50
                                                ? 'Your resume will be partially filled. Some sections may appear empty.'
                                                : 'Most sections will be empty. Consider completing your profile first.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Missing Sections */}
                        {missingCount > 0 && (
                            <div className="px-6 pb-4 max-h-64 overflow-y-auto space-y-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                    Missing Information ({missingCount} field{missingCount !== 1 ? 's' : ''})
                                </p>
                                {Object.entries(analysis.sections).map(([section, tags]) => {
                                    const Icon = SECTION_ICONS[section] || User;
                                    return (
                                        <div key={section} className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon size={14} className="text-slate-400" />
                                                <span className="text-xs font-bold text-white capitalize">{section}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {tags.map(tag => (
                                                    <span key={tag} className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                                                        {getTagLabel(tag)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="p-6 border-t border-white/5 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => {
                                    onProceed();
                                    onClose();
                                }}
                                className="flex-1 py-3 px-4 bg-[#7D2AE8] hover:bg-[#6a24c5] text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {canProceed ? (
                                    <>
                                        Continue <ArrowRight size={16} />
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={16} /> Proceed Anyway
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
