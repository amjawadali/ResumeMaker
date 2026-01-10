import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { CheckCircle, Wand2 } from 'lucide-react';
import Modern from '@/Components/Templates/Modern';
import ScaleFit from '@/Components/ScaleFit';

export default function Create({ auth, templates, template_id, data: previewData }) {
    const { data, setData, post, processing, errors } = useForm({
        title: 'My Resume',
        template_id: template_id || (templates.length > 0 ? templates[0].id : ''),
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('resumes.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Resume" />
            <div className="bg-[#0f172a] min-h-screen text-white pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
                        <div className="inline-flex items-center justify-center p-2 bg-indigo-500/10 rounded-xl mb-2 ring-1 ring-inset ring-indigo-500/20">
                            <Wand2 className="text-indigo-400 w-4 h-4 mr-2" />
                            <span className="text-indigo-300 font-bold tracking-wide text-xs uppercase">AI-Powered Builder</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight leading-tight">
                            Craft Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Perfect Resume</span>
                        </h2>
                        <p className="text-slate-400 text-sm">
                            Select a professionally designed template below to get started.
                        </p>
                    </div>

                    <form onSubmit={submit} className="relative z-10">
                        {/* Name Input Section */}
                        <div className="max-w-md mx-auto mb-12 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-[#0f172a] ring-1 ring-white/10 rounded-xl p-1.5 flex items-center">
                                <div className="flex-grow">
                                    <InputLabel value="Resume Name" className="sr-only" />
                                    <TextInput
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full bg-transparent border-none text-white text-lg font-bold p-3 focus:ring-0 placeholder-slate-600"
                                        placeholder="e.g. Senior Product Designer"
                                        autoFocus
                                    />
                                </div>
                                <PrimaryButton disabled={processing} className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 py-2.5 px-6 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 whitespace-nowrap">
                                    Create
                                </PrimaryButton>
                            </div>
                            {errors.title && <div className="absolute -bottom-6 left-4 text-red-400 text-xs font-bold">{errors.title}</div>}
                        </div>

                        {/* Templates Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                            {templates.map(template => (
                                <div
                                    key={template.id}
                                    onClick={() => setData('template_id', template.id)}
                                    className={`group cursor-pointer relative rounded-2xl bg-[#1e293b] overflow-hidden transition-all duration-500 ${data.template_id == template.id ? 'ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20 scale-[1.01]' : 'ring-1 ring-white/10 hover:ring-white/20 hover:scale-[1.005]'}`}
                                >
                                    {/* Preview Area Container */}
                                    <div className="aspect-[1/1.414] bg-slate-900 relative overflow-hidden">
                                        {/* ScaleFit Wrapper for A4 Template */}
                                        <ScaleFit width={794} height={1123} className="bg-white pointer-events-none select-none">
                                            {/* Render Template Component Dynamically */}
                                            {template.slug === 'modern' || true ? ( // Fallback to Modern for now as it's the only one
                                                <Modern data={previewData} mode="preview" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-black text-4xl">
                                                    {template.name}
                                                </div>
                                            )}
                                        </ScaleFit>
                                    </div>

                                    {/* Selection Overlay */}
                                    <div className={`absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px] transition-opacity duration-300 flex items-center justify-center ${data.template_id == template.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <div className={`transform transition-all duration-300 ${data.template_id == template.id ? 'scale-100 translate-y-0' : 'scale-75 translate-y-4'}`}>
                                            {data.template_id == template.id ? (
                                                <div className="bg-white text-indigo-600 rounded-full p-5 shadow-2xl ring-4 ring-indigo-500/30">
                                                    <CheckCircle size={48} className="fill-current" />
                                                </div>
                                            ) : (
                                                <span className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl">
                                                    Select Template
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-6 bg-[#1e293b] border-t border-white/5 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-white font-bold text-lg leading-tight">{template.name}</h3>
                                            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-1">Professional Series</p>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">
                                            A4
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
