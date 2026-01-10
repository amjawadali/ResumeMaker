import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { confirmAction } from '@/Components/ConfirmDialog';

export default function Index({ templates }) {
    const toggleStatus = (id) => {
        router.post(route('admin.templates.toggle-active', id));
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmAction({
            title: 'Delete Template?',
            message: 'Are you sure you want to delete this template? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete'
        });

        if (confirmed) {
            router.delete(route('admin.templates.destroy', id), {
                onSuccess: () => toast.success('Template deleted successfully')
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Manage Templates" />
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white">Templates</h2>
                <Link href={route('admin.templates.create')} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center shadow-lg shadow-purple-900/20 transition-all">
                    <Plus size={16} className="mr-2" /> Add Template
                </Link>
            </div>

            <div className="bg-[#1e293b] rounded-[2rem] border border-white/5 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-[#0f172a] text-slate-300 uppercase font-black tracking-widest text-xs">
                        <tr>
                            <th className="px-8 py-4">Preview</th>
                            <th className="px-8 py-4">Name</th>
                            <th className="px-8 py-4">Category</th>
                            <th className="px-8 py-4">View Path</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {templates.map(template => (
                            <tr key={template.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-8 py-4">
                                    <div className="w-16 h-20 bg-slate-800 rounded-lg overflow-hidden border border-white/10">
                                        {template.preview_image ? (
                                            <img src={'/storage/' + template.preview_image} alt={template.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600">N/A</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-4 font-bold text-white">{template.name}</td>
                                <td className="px-8 py-4 capitalize">{template.category}</td>
                                <td className="px-8 py-4 font-mono text-xs">{template.blade_view}</td>
                                <td className="px-8 py-4">
                                    <button onClick={() => toggleStatus(template.id)} className={`flex items-center text-xs font-bold uppercase tracking-widest ${template.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {template.is_active ? <CheckCircle size={14} className="mr-1" /> : <XCircle size={14} className="mr-1" />}
                                        {template.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-3">
                                        <Link href={route('admin.templates.edit', template.id)} className="text-blue-400 hover:text-blue-300 transition-colors">
                                            <Edit size={18} />
                                        </Link>
                                        <button onClick={() => handleDelete(template.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {templates.length === 0 && (
                            <tr><td colSpan="6" className="px-8 py-8 text-center opacity-50">No templates found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
