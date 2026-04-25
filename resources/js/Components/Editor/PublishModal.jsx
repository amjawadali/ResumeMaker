import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, CheckCircle2, AlertCircle, Globe, ShieldCheck } from 'lucide-react';

export default function PublishModal({ isOpen, onClose, onPublish, initialTitle }) {
    const [title, setTitle] = useState(initialTitle || '');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Professional');
    const [isPublic, setIsPublic] = useState(true);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreeToTerms) return;

        setIsSubmitting(true);
        try {
            await onPublish({
                title,
                description,
                category,
                is_public: isPublic,
                type: 'user_content'
            });
            onClose();
        } catch (error) {
            console.error('Publish failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#0E1318] border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
                >
                    {/* Header - Compact */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#7D2AE8] p-2 rounded-xl text-white">
                                <UploadCloud size={18} />
                            </div>
                            <h2 className="text-lg font-black text-white tracking-tight leading-none">Publish</h2>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Template Name"
                                    className="w-full px-4 py-2.5 bg-white/5 border-white/10 text-white text-sm rounded-xl focus:ring-[#7D2AE8] focus:border-[#7D2AE8] transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly describe the style..."
                                    className="w-full px-4 py-2.5 bg-white/5 border-white/10 text-white text-sm rounded-xl focus:ring-[#7D2AE8] focus:border-[#7D2AE8] transition-all resize-none font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white/5 border-white/10 text-white text-sm rounded-xl focus:ring-[#7D2AE8] focus:border-[#7D2AE8] font-bold"
                                    >
                                        <option className="bg-[#0E1318]">Professional</option>
                                        <option className="bg-[#0E1318]">Creative</option>
                                        <option className="bg-[#0E1318]">Minimalist</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Visibility</label>
                                    <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setIsPublic(true)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isPublic ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            <Globe size={11} /> Public
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsPublic(false)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!isPublic ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            <AlertCircle size={11} /> Private
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lean Guidelines */}
                        <div className="flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                            <ShieldCheck size={16} className="text-purple-400 flex-shrink-0" />
                            <p className="text-[10px] text-slate-400 font-medium italic underline decoration-purple-500/30">
                                Verify tagging & remove all personal data before submission.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer group px-1">
                                <input
                                    type="checkbox"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className="mt-0.5 rounded bg-white/5 border-white/10 text-[#7D2AE8] focus:ring-[#7D2AE8] w-3 h-3"
                                />
                                <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors font-medium leading-tight">
                                    I confirm this is my original design and allow it to be hosted publicly.
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={!agreeToTerms || isSubmitting}
                                className="w-full py-3.5 bg-[#7D2AE8] text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-[#6a24c5] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Processing...' : 'Submit Design'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
