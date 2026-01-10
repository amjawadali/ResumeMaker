import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';

export default function Index({ auth, templates }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Browse Templates" />

            <div className="py-12 bg-[#0f172a] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-white mb-4">Choose Your Design</h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Select a template that fits your profession and personality. All templates are ATS-friendly and fully customizable.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {templates.map(template => (
                            <div key={template.id} className="group relative bg-slate-800 rounded-[2rem] overflow-hidden border border-white/5 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                                <div className="aspect-[1/1.414] bg-white relative overflow-hidden">
                                    {/* Preview Image or Iframe */}
                                    {template.preview_image ? (
                                        <img src={template.preview_image} alt={template.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                            <span className="font-bold text-xl uppercase tracking-widest">Preview</span>
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4">
                                        <Link href={route('templates.show', template.id)} className="px-8 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center">
                                            <Eye size={16} className="mr-2" /> View Details
                                        </Link>
                                        <Link href={route('resumes.create', { template_id: template.id })} className="px-8 py-3 bg-purple-600 text-white hover:bg-purple-500 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center shadow-lg shadow-purple-600/20">
                                            <Plus size={16} className="mr-2" /> Use This Template
                                        </Link>
                                        <a href={route('templates.preview', template.id)} target="_blank" className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest underline decoration-wavy decoration-purple-500/50 underline-offset-4">Live Preview</a>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-800/50 backdrop-blur border-t border-white/5 absolute bottom-0 inset-x-0">
                                    <h3 className="text-xl font-black text-white mb-1">{template.name}</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{template.colors_supported ? template.colors_supported.length + ' Colors' : 'Multi-Color'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
