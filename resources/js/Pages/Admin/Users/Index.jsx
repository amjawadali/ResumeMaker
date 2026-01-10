import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Trash2, User, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { confirmAction } from '@/Components/ConfirmDialog';

export default function Index({ users }) {
    const handleDelete = async (id) => {
        const confirmed = await confirmAction({
            title: 'Delete User?',
            message: 'Are you sure you want to delete this user? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete'
        });

        if (confirmed) {
            router.delete(route('admin.users.destroy', id), {
                onSuccess: () => toast.success('User deleted successfully')
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Manage Users" />
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white">Users</h2>
            </div>

            <div className="bg-[#1e293b] rounded-[2rem] border border-white/5 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-[#0f172a] text-slate-300 uppercase font-black tracking-widest text-xs">
                        <tr>
                            <th className="px-8 py-4">Name</th>
                            <th className="px-8 py-4">Email</th>
                            <th className="px-8 py-4">Role</th>
                            <th className="px-8 py-4">Joined</th>
                            <th className="px-8 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.data.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-8 py-4 font-bold text-white flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mr-3">
                                        <User size={16} />
                                    </div>
                                    {user.name}
                                </td>
                                <td className="px-8 py-4">{user.email}</td>
                                <td className="px-8 py-4">
                                    {user.roles.map(role => (
                                        <span key={role.id} className="inline-flex items-center px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                            <Shield size={10} className="mr-1" /> {role.name}
                                        </span>
                                    ))}
                                </td>
                                <td className="px-8 py-4 font-mono text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="px-8 py-4">
                                    <button onClick={() => handleDelete(user.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination could go here */}
                <div className="p-4 border-t border-white/5">
                    {/* Simplified pagination links rendering logic */}
                </div>
            </div>
        </AdminLayout>
    );
}
