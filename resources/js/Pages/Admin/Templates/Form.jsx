import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function Form({ template = {} }) {
    const isEdit = !!template.id;
    const { data, setData, post, put, processing, errors } = useForm({
        name: template.name || '',
        description: template.description || '',
        category: template.category || 'modern',
        blade_view: template.blade_view || '',
        preview_image: null,
        is_active: template.is_active !== undefined ? template.is_active : true,
        _method: isEdit ? 'PUT' : 'POST',
    });

    const submit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? 'admin.templates.update' : 'admin.templates.store';
        const routeParams = isEdit ? template.id : undefined;
        // Logic for file upload with PUT requires using POST + _method
        if (isEdit) {
            post(route(routeName, routeParams));
        } else {
            post(route(routeName));
        }
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? `Edit ${template.name}` : "Create Template"} />
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-black text-white mb-8">{isEdit ? 'Edit Template' : 'New Template'}</h2>

                <form onSubmit={submit} className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 space-y-6">
                    <div>
                        <InputLabel value="Template Name" className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2" />
                        <TextInput value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                        {errors.name && <div className="text-red-400 text-sm mt-1">{errors.name}</div>}
                    </div>

                    <div>
                        <InputLabel value="Description" className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2" />
                        <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="block w-full rounded-2xl border-white/10 bg-[#0f172a] min-h-[100px] p-4 text-sm text-white focus:border-purple-500 focus:ring-purple-500"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <InputLabel value="Category" className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2" />
                            <select value={data.category} onChange={e => setData('category', e.target.value)} className="block w-full rounded-2xl border-white/10 bg-[#0f172a] px-4 py-3 text-white focus:border-purple-500 focus:ring-purple-500">
                                {['modern', 'classic', 'creative', 'minimal', 'executive'].map(c => (
                                    <option key={c} value={c} className="capitalize">{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Blade View Path (e.g., templates.modern)" className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2" />
                            <TextInput value={data.blade_view} onChange={e => setData('blade_view', e.target.value)} className="w-full bg-[#0f172a] border-white/10 text-white" />
                            {errors.blade_view && <div className="text-red-400 text-sm mt-1">{errors.blade_view}</div>}
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Preview Image" className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2" />
                        <input type="file" onChange={e => setData('preview_image', e.target.files[0])} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer" />
                    </div>

                    <div className="flex items-center space-x-3 bg-[#0f172a] p-4 rounded-xl border border-white/5">
                        <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} id="is_active" className="rounded bg-[#1e293b] border-white/10 text-purple-600 focus:ring-offset-gray-900" />
                        <label htmlFor="is_active" className="text-white font-bold text-sm">Active (Visible to users)</label>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-end">
                        <PrimaryButton disabled={processing} className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">
                            {isEdit ? 'Update Template' : 'Create Template'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
