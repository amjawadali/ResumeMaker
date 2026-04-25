import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle, Eye, AlertTriangle, ShieldCheck, Clock, Sparkles, Layout, MessageSquare, Trash2 } from 'lucide-react';
import MagicPreview from '@/Components/Marketplace/MagicPreview';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Moderation({ auth, templates, adminProfile }) {
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApprove = (id) => {
        if (!confirm('Approve this template for the public marketplace?')) return;
        
        setIsProcessing(true);
        router.post(route('admin.templates.approve', id), {}, {
            onSuccess: () => {
                toast.success('Template approved!');
                setPreviewTemplate(null);
            },
            onFinish: () => setIsProcessing(false)
        });
    };

    const handleReject = (id) => {
        if (!rejectionReason) {
            toast.error('Please provide a reason for rejection.');
            return;
        }

        setIsProcessing(true);
        router.post(route('admin.templates.reject', id), { reason: rejectionReason }, {
            onSuccess: () => {
                toast.success('Template rejected.');
                setPreviewTemplate(null);
                setRejectionReason('');
            },
            onFinish: () => setIsProcessing(false)
        });
    };

    const handleApproveDeletion = (id) => {
        if (!confirm('Are you sure you want to approve this deletion? It will be removed from the marketplace but existing resumes will be preserved.')) return;
        
        setIsProcessing(true);
        router.post(route('admin.templates.approve_deletion', id), {}, {
            onSuccess: () => {
                toast.success('Template securely soft-deleted.');
                setPreviewTemplate(null);
            },
            onFinish: () => setIsProcessing(false)
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Moderation Studio</h2>}
        >
            <Head title="Moderation Queue" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight leading-none">Review Queue</h3>
                                <p className="text-sm text-slate-400 mt-2 font-bold uppercase tracking-widest">{templates.length} Submissions Pending</p>
                            </div>
                        </div>
                    </div>

                    {templates.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem]">
                            <Layout size={64} className="text-white/5 mb-6" />
                            <h4 className="text-xl font-black text-slate-500">All submissions cleared!</h4>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {templates.map(template => (
                                <div key={template.id} className="group bg-white/5 rounded-[2.5rem] p-6 border border-white/10 hover:border-purple-500/30 transition-all shadow-sm hover:shadow-2xl hover:shadow-purple-500/10">
                                    {/* Thumbnail Preview */}
                                    <div className="aspect-[1/1.414] bg-white/5 rounded-3xl overflow-hidden relative border border-white/5 mb-6">
                                        <img src={template.preview_image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" alt="preview" />
                                        
                                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 text-center">
                                            <button 
                                                onClick={() => setPreviewTemplate(template)}
                                                className="w-full py-3 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                                            >
                                                <Sparkles size={16} className="mr-2 text-purple-500" /> 
                                                Live Magic Review
                                            </button>
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            {template.is_deletion_requested ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 px-3 py-1 rounded-full border border-rose-500/10">Delete Request</span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full border border-amber-500/10">Pending Approval</span>
                                            )}
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{template.category}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-white truncate">{template.name}</h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black border border-white/10 text-slate-300">{template.user?.name?.charAt(0)}</div>
                                                <span className="text-xs font-bold text-slate-400">By {template.user?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Studio Modal */}
            <AnimatePresence>
                {previewTemplate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 bg-slate-950/90 backdrop-blur-xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-6xl h-full max-h-[85vh] overflow-hidden flex flex-col md:flex-row border border-white/10"
                        >
                            {/* Live Preview Pane */}
                            <div className="flex-1 bg-slate-950/50 relative p-8 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full max-w-[500px] shadow-2xl rounded-xl overflow-hidden bg-white">
                                    <MagicPreview 
                                        canvasData={previewTemplate.canvas_data}
                                        profile={adminProfile}
                                    />
                                </div>
                                <div className="absolute top-6 left-6 p-4 bg-slate-900/80 backdrop-blur rounded-2xl border border-white/10 flex items-center gap-3">
                                    <Sparkles className="text-purple-500" size={20} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 leading-none text-white">Live Review</p>
                                        <p className="text-xs font-black text-white mt-1">Simulating with Admin Profile</p>
                                    </div>
                                </div>
                            </div>

                            {/* Moderation Pane */}
                            <div className="w-full md:w-[400px] bg-transparent p-12 flex flex-col justify-between border-l border-white/10">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
                                            <Layout size={24} />
                                        </div>
                                        <button onClick={() => setPreviewTemplate(null)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                                            <XCircle size={24} className="text-slate-500" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-white tracking-tight">{previewTemplate.name}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed italic">{previewTemplate.description || 'No description provided.'}</p>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quality Control Notes</label>
                                        <textarea 
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Provide feedback if rejecting..."
                                            className="w-full p-4 bg-white/5 border-white/10 rounded-2xl focus:ring-purple-500 focus:border-purple-500 min-h-[140px] text-sm text-white placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 mt-8">
                                    {previewTemplate.is_deletion_requested ? (
                                        <button 
                                            onClick={() => handleApproveDeletion(previewTemplate.id)}
                                            disabled={isProcessing}
                                            className="w-full py-4 bg-rose-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3"
                                        >
                                            <Trash2 size={18} />
                                            Approve Deletion
                                        </button>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => handleApprove(previewTemplate.id)}
                                                disabled={isProcessing}
                                                className="w-full py-4 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                                            >
                                                <CheckCircle size={18} />
                                                Approve & Publish
                                            </button>
                                            <button 
                                                onClick={() => handleReject(previewTemplate.id)}
                                                disabled={isProcessing || !rejectionReason}
                                                className="w-full py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                            >
                                                <MessageSquare size={18} />
                                                Reject with Feedback
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
