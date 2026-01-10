import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, CheckCircle, FileText, BarChart, PenTool, Trash2 } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import ScaleFit from '@/Components/ScaleFit';
import { toast } from 'sonner';
import { confirmAction } from '@/Components/ConfirmDialog';

export default function Dashboard({ auth, resumes, completion }) {
    const user = auth.user;

    // Helper to calculate circle offset
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (completion / 100) * circumference;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="relative min-h-screen bg-[#0f172a] overflow-hidden font-sans pb-20">
                {/* Background Gradients */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{user.name}</span>
                            </h2>
                            <p className="mt-2 text-slate-400 font-medium text-lg">Manage your career assets and track your progress.</p>
                        </div>
                        <Link href={route('resumes.create')} className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 transition-all duration-300 hover:scale-[1.02]">
                            <span className="relative flex items-center font-bold text-white uppercase tracking-widest text-xs">
                                <Plus className="w-5 h-5 mr-3 text-purple-400" />
                                Create New Resume
                            </span>
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
                        {/* Profile Completion */}
                        <div className="lg:col-span-8 relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 group">
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="relative w-32 h-32 flex-shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="text-purple-500 transition-all duration-1000 ease-out" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-2xl font-black text-white">{completion}%</span>
                                    </div>
                                </div>
                                <div className="flex-grow text-center md:text-left">
                                    <h3 className="text-2xl font-bold text-white mb-2">Profile Status</h3>
                                    {completion < 100 ? (
                                        <>
                                            <p className="text-slate-400 mb-6 font-light leading-relaxed">Your profile is incomplete. Add more details to unlock the full potential of your resumes.</p>
                                            <Link href={route('user-details.index')} className="inline-flex items-center text-purple-400 hover:text-purple-300 font-bold uppercase text-xs tracking-widest transition-colors">
                                                Complete Profile <CheckCircle className="w-4 h-4 ml-2" />
                                            </Link>
                                        </>
                                    ) : (
                                        <p className="text-slate-400 font-light leading-relaxed">Excellent! Your profile is fully optimized and ready for job applications.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Column */}
                        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
                            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/5 hover:bg-white/10 transition-colors group cursor-default">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Resumes</span>
                                    <FileText className="w-5 h-5 text-pink-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-3xl font-black text-white">{user.resumes_count || 0}</span>
                            </div>
                            <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/5 hover:bg-white/10 transition-colors group cursor-default">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Skills Logged</span>
                                    <BarChart className="w-5 h-5 text-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-3xl font-black text-white">{user.skills_count || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                        <Link href={route('user-details.index')} className="group p-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all duration-300">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <PenTool className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-white font-bold mb-1">Personal Info</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Update Details</p>
                        </Link>
                        <Link href={route('templates.index')} className="group p-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-3xl border border-white/5 hover:border-pink-500/30 transition-all duration-300">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-white font-bold mb-1">Templates</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Explore Designs</p>
                        </Link>
                    </div>

                    {/* Resumes Grid */}
                    <h3 className="text-2xl font-black text-white mb-8 flex items-center">
                        Your Resumes
                        <span className="ml-4 text-xs font-bold bg-white/10 text-slate-300 px-3 py-1 rounded-full border border-white/5">{resumes.length}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {resumes.map(resume => (
                            <div key={resume.id} className="group relative flex flex-col h-full">
                                <div className="resume-card relative w-full rounded-3xl overflow-hidden bg-slate-800 border border-slate-700/50 shadow-2xl transition-all duration-300 hover:shadow-purple-500/20 hover:border-purple-500/30">
                                    <div className="bg-white">
                                        <ScaleFit width={794} height={1123}>
                                            <iframe
                                                src={route('resumes.preview', { resume: resume.id, mode: 'card' })}
                                                className="w-full h-full border-none pointer-events-none"
                                                scrolling="no"
                                                loading="lazy"
                                            />
                                        </ScaleFit>
                                    </div>

                                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pointer-events-none z-10"></div>

                                    <div className="absolute bottom-0 inset-x-0 p-5 z-20">
                                        <h4 className="text-base font-bold text-white mb-1.5 truncate drop-shadow-md">{resume.title}</h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest bg-black/40 backdrop-blur px-2.5 py-1 rounded-md">
                                                {resume.template?.name || 'Template'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 flex flex-col items-center justify-center p-6 gap-3">
                                        <Link href={route('resumes.edit', resume.id)} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-purple-900/40 hover:scale-105 transition-all flex items-center justify-center gap-2">
                                            <PenTool size={16} /> Edit Resume
                                        </Link>
                                        <button
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                const confirmed = await confirmAction({
                                                    title: 'Delete Resume?',
                                                    message: 'Are you sure you want to delete this resume? This action cannot be undone.',
                                                    type: 'danger',
                                                    confirmText: 'Delete'
                                                });

                                                if (confirmed) {
                                                    router.delete(route('resumes.destroy', resume.id), {
                                                        onSuccess: () => toast.success('Resume deleted successfully')
                                                    });
                                                }
                                            }}
                                            className="w-full py-3 bg-white/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-red-500/30"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {resumes.length === 0 && (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center">
                                <h3 className="text-2xl font-black text-white mb-2">No resumes yet</h3>
                                <Link href={route('resumes.create')} className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-purple-900/20 hover:scale-105 transition-all">
                                    Create Resume
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
