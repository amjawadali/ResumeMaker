import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { Eye, Plus, Sparkles, User, Star, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MagicPreview from './MagicPreview';
import FillScorer from '@/Utils/FillScorer';
import { useTelemetry } from '@/Hooks/useTelemetry';
import { useEffect, useRef } from 'react';

export default function TemplateCard({ template, profile, isMagicFillActive }) {
    const [isHovered, setIsHovered] = useState(false);
    const { fireEvent, trackImpression } = useTelemetry();
    const cardRef = useRef(null);

    // Impression tracking
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                trackImpression('Template', template.id);
            }
        }, { threshold: 0.5 });

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, [template.id, trackImpression]);

    const analysis = useMemo(() => {
        return FillScorer.analyze(template.canvas_data, profile);
    }, [template.canvas_data, profile]);

    const readinessScore = analysis.score;
    const missingFields = analysis.missing;

    // Map semantic tags to human readable names
    const tagLabels = {
        'full_name': 'Full Name',
        'email': 'Email',
        'phone': 'Phone Number',
        'location': 'Location/Address',
        'summary': 'Summary',
        'experience_repeater': 'Work Experience',
        'education_repeater': 'Education',
        'skill_name': 'Skills',
        'linkedin': 'LinkedIn',
        'website': 'Website/Portfolio',
        'profile_photo': 'Profile Photo',
        'position': 'Job Title'
    };

    // Color mapping for categories
    const categoryColors = {
        'Professional': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Creative': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        'Tech': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'Academic': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'Minimalist': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };

    return (
        <motion.div
            ref={cardRef}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex flex-col bg-[#1A202C] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500"
        >
            {/* Template Badge (Top Left) */}
            <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${categoryColors[template.category] || categoryColors.Minimalist}`}>
                {template.category}
            </div>

            {/* Verification Badge (Top Right) */}
            {template.status === 'approved' && (
                <div className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-md rounded-full text-white/50 border border-white/10" title="Community Verified">
                    <ShieldCheck size={14} className="text-emerald-400" />
                </div>
            )}

            {/* Preview Section */}
            <div className="aspect-[1/1.414] bg-white relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {isMagicFillActive && isHovered ? (
                        <MagicPreview 
                            key="magic"
                            canvasData={template.canvas_data} 
                            profile={profile} 
                        />
                    ) : (
                        <motion.img
                            key="static"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            src={template.preview_image}
                            alt={template.name}
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        />
                    )}
                </AnimatePresence>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 z-20">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center gap-3">
                        <Link 
                            href={route('templates.show', template.id)} 
                            onClick={() => fireEvent('engagement', 'Template', template.id)}
                            className="w-48 py-3 bg-white text-slate-900 hover:bg-slate-50 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center shadow-xl"
                        >
                            <Eye size={16} className="mr-2" /> View Layout
                        </Link>
                        <Link 
                            href={route('resumes.create', { template_id: template.id })} 
                            onClick={() => fireEvent('usage', 'Template', template.id)}
                            className="w-48 py-3 bg-[#7D2AE8] text-white hover:bg-[#6a24c5] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center shadow-xl shadow-purple-500/40"
                        >
                            <Plus size={16} className="mr-2" /> Start Creating
                        </Link>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-black text-white leading-tight">{template.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-bold border border-white/10">
                                {template.user?.name?.charAt(0) || 'A'}
                            </div>
                            <span className="text-xs text-slate-400 font-bold">by {template.user?.name || 'ResumeMaker'}</span>
                        </div>
                    </div>
                    
                    {/* Use Count Badge */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                            <TrendingUp size={12} />
                            <span className="text-[10px] font-black">{template.use_count || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Rating & Tags */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-amber-400">
                            <Star size={14} fill="currentColor" />
                            <span className="text-xs font-black">{template.fill_score_avg ? (template.fill_score_avg / 20).toFixed(1) : '4.8'}</span>
                        </div>
                        
                        {isMagicFillActive && (
                            <div className="relative group/score">
                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter cursor-help ${
                                    readinessScore > 90 ? 'bg-emerald-500/20 text-emerald-400' : 
                                    readinessScore > 50 ? 'bg-amber-500/20 text-amber-400' : 
                                    'bg-slate-500/20 text-slate-400'
                                }`}>
                                    <Sparkles size={10} />
                                    {readinessScore}% Ready
                                </div>
                                
                                {missingFields.length > 0 && (
                                    <div className="absolute bottom-full left-0 mb-2 w-40 bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl opacity-0 invisible group-hover/score:opacity-100 group-hover/score:visible transition-all z-50 pointer-events-none">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">
                                            Missing Info
                                        </div>
                                        <div className="space-y-1">
                                            {missingFields.slice(0, 4).map(tag => (
                                                <div key={tag} className="text-[10px] text-slate-300 font-bold flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                                                    {tagLabels[tag] || (tag.startsWith('experience_') ? 'Work History' : tag)}
                                                </div>
                                            ))}
                                            {missingFields.length > 4 && (
                                                <div className="text-[9px] text-slate-500 italic mt-1 font-medium">
                                                    + {missingFields.length - 4} more gaps
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-1">
                        {template.tags?.slice(0, 2).map(tag => (
                            <span key={tag.id} className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter bg-slate-800 px-1.5 py-0.5 rounded">
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
