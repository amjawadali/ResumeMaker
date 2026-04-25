import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Layout, Clock, CheckCircle2, AlertCircle, TrendingUp, Sparkles, LayoutGrid, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ auth, templates }) {
    const handleRequestDeletion = (id) => {
        if(confirm('Are you sure you want to request deletion of this design?')) {
            router.post(route('creator.templates.request_deletion', id));
        }
    };
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Creator Studio - Dashboard" />

            <div className="min-h-screen bg-[#0E1318] text-white py-12 px-6 lg:px-12">
                <div className="max-w-[1200px] mx-auto space-y-12">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/5">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full w-fit">
                                <Sparkles size={14} className="text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Creator Hub</span>
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter text-white">Your Design Portfolio</h1>
                            <p className="text-slate-400 text-lg max-w-xl font-medium">Build, manage, and track your public resume templates.</p>
                        </div>

                        <Link 
                            href={route('creator.templates.create')}
                            className="bg-[#7D2AE8] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#6a24c5] transition-all shadow-xl shadow-purple-500/20"
                        >
                            <Plus size={18} />
                            Create New Template
                        </Link>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard label="Total Templates" value={templates.length} icon={Layout} color="blue" />
                        <StatCard label="Total Uses" value={templates.reduce((acc, t) => acc + (t.resumes_count || 0), 0)} icon={TrendingUp} color="emerald" />
                        <StatCard label="Approved Designs" value={templates.filter(t => t.status === 'approved').length} icon={CheckCircle2} color="purple" />
                    </div>

                    {/* Template List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <LayoutGrid className="text-slate-500" />
                                My Submissions
                            </h2>
                        </div>

                        {templates.length === 0 ? (
                            <div className="py-24 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-6 bg-slate-800/40 rounded-full border border-white/5">
                                    <Layout size={40} className="text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white">No templates yet</h3>
                                <p className="text-slate-500 max-w-xs font-medium italic text-sm">Start your journey as a creator by designing your first community template.</p>
                                <Link 
                                    href={route('creator.templates.create')}
                                    className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm mt-4 hover:bg-slate-100 transition-all"
                                >
                                    Design First Template
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {templates.map((template) => (
                                    <div key={template.id} className="group bg-[#1A202C] border border-white/5 rounded-3xl p-6 flex gap-6 hover:border-purple-500/30 transition-all">
                                        {/* Thumbnail */}
                                        <div className="w-32 aspect-[1/1.414] bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 shadow-2xl relative">
                                            <img src={template.preview_image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" alt="preview" />
                                            {/* Status Badge */}
                                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                <StatusBadge status={template.status} />
                                                {template.is_deletion_requested && (
                                                    <div className="p-1 px-2 bg-rose-900/80 text-rose-200 border border-rose-500/50 rounded-lg flex items-center gap-1 backdrop-blur-md">
                                                        <Trash2 size={10} />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">Deletion Pending</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{template.category}</span>
                                                    <div className="flex items-center gap-1 text-emerald-400">
                                                        <TrendingUp size={12} />
                                                        <span className="text-[10px] font-black">{template.resumes_count || 0} Uses</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-black text-white">{template.name}</h3>
                                                <p className="text-xs text-slate-500 font-medium line-clamp-2">{template.description}</p>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                {template.status === 'rejected' && (
                                                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2">
                                                        <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                                                        <p className="text-[10px] text-rose-300 font-bold leading-tight line-clamp-2">
                                                            Feedback: {template.moderation_feedback}
                                                        </p>
                                                    </div>
                                                )}

                                                <Link 
                                                    href={route('creator.templates.edit', template.id)}
                                                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <Pencil size={14} />
                                                    Edit Design
                                                </Link>
                                                
                                                {!template.is_deletion_requested && (
                                                    <button 
                                                        onClick={() => handleRequestDeletion(template.id)}
                                                        className="w-full py-2.5 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 text-rose-400 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                        Request Deletion
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, icon: Icon, color }) {
    const colors = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    };
    return (
        <div className={`p-8 rounded-[2rem] border backdrop-blur-xl flex items-center justify-between ${colors[color]}`}>
            <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
                <p className="text-4xl font-black tracking-tighter">{value}</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl">
                <Icon size={24} />
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    switch(status) {
        case 'approved': return <div className="p-1 px-2 bg-emerald-500 text-white rounded-lg flex items-center gap-1 shadow-lg shadow-emerald-500/40"><CheckCircle2 size={12} /><span className="text-[8px] font-black uppercase tracking-widest">Live</span></div>;
        case 'rejected': return <div className="p-1 px-2 bg-rose-500 text-white rounded-lg flex items-center gap-1 shadow-lg shadow-rose-500/40"><AlertCircle size={12} /><span className="text-[8px] font-black uppercase tracking-widest">Action Required</span></div>;
        default: return <div className="p-1 px-2 bg-amber-500 text-white rounded-lg flex items-center gap-1 shadow-lg shadow-amber-500/40"><Clock size={12} /><span className="text-[8px] font-black uppercase tracking-widest">Reviewing</span></div>;
    }
}
