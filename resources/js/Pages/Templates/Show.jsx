import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Check, ArrowRight } from 'lucide-react';

export default function Show({ auth, template }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={template.name} />

            <div className="py-12 bg-[#0f172a] min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Preview Side */}
                        <div className="relative group perspective-1000">
                            <div className="w-full max-w-md mx-auto aspect-[1/1.414] bg-white rounded-[2rem] shadow-2xl rotate-y-12 transform transition-transform duration-500 group-hover:rotate-0 overflow-hidden relative">
                                {template.preview_image ? (
                                    <img src={template.preview_image} alt={template.name} className="w-full h-full object-cover" />
                                ) : (
                                    <iframe
                                        src={route('templates.preview', template.id)}
                                        className="w-full h-full border-none pointer-events-none scale-[0.5] origin-top-left"
                                        style={{ width: '200%', height: '200%' }}
                                    />
                                )}
                            </div>
                            {/* Floating Elements */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                        </div>

                        {/* Info Side */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-5xl font-black text-white mb-4 leading-tight">{template.name}</h2>
                                <p className="text-xl text-slate-400 leading-relaxed max-w-lg">{template.description || 'A professional design tailored for modern industries. Clean, readable, and impactful.'}</p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-purple-400">Key Features</h3>
                                <ul className="space-y-3">
                                    {['ATS-Friendly Structure', 'Customizable Colors', 'Professional Typography', 'Optimized White Space'].map((feature, i) => (
                                        <li key={i} className="flex items-center text-slate-300 font-bold">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3 text-emerald-400">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-8 flex flex-col sm:flex-row gap-4">
                                <Link href={route('resumes.create', { template_id: template.id })} className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-purple-600/20 flex items-center justify-center group transition-all hover:scale-105">
                                    Create Resume <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a href={route('templates.preview', template.id)} target="_blank" className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center transition-all">
                                    Live Preview
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
