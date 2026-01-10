import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Preview from './Preview'; // Reuse the Preview engine
import { Edit, Download, ArrowLeft } from 'lucide-react';

export default function Show({ auth, resume, template_view, data }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={resume.title} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 bg-[#0f172a] border-b border-white/5 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
                <div className="flex items-center">
                    <Link href={route('dashboard')} className="mr-8 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-white">{resume.title}</h1>
                        <p className="text-sm text-slate-500 font-mono">Last edited: {new Date(resume.updated_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <a href={route('resumes.download-pdf', resume.id)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center transition-all">
                        <Download size={16} className="mr-2" /> Download PDF
                    </a>
                    <Link href={route('resumes.edit', resume.id)} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center shadow-lg shadow-purple-900/20 transition-all">
                        <Edit size={16} className="mr-2" /> Edit Resume
                    </Link>
                </div>
            </div>

            <div className="py-12 bg-slate-900 min-h-screen flex justify-center overflow-auto">
                <div className="origin-top scale-75 md:scale-90 lg:scale-100">
                    {/* Reuse Preview Component in 'preview' mode */}
                    <Preview
                        resume={resume}
                        template_view={template_view}
                        mode="preview"
                        data={data}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
