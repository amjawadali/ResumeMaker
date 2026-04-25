import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Trash2, User, Shield, UserPlus, X, Key, Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import { confirmAction } from '@/Components/ConfirmDialog';
import Modal from '@/Components/Modal';
import { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ users, roles, allRoles, allPermissions }) {
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const permissionCategories = {
        'System & Security': ['view_admin_dashboard', 'manage_settings', 'view_audit_logs'],
        'User Management': ['manage_users', 'manage_roles', 'manage_permissions', 'assign_roles'],
        'Content Moderation': ['manage_templates', 'moderate_content'],
        'Resume Activities': ['create_resume', 'edit_resume', 'delete_resume', 'download_resume']
    };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: allRoles.filter(r => r.name !== 'super-admin')[0]?.name || '',
    });

    const handleRoleChange = (userId, roleName) => {
        router.post(route('admin.users.assign-role', userId), { 
            role: roleName 
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Role assigned successfully')
        });
    };

    const handleDelete = async (id) => {
        const confirmed = await confirmAction({
            title: 'Delete User?',
            message: 'Are you sure you want to delete this user? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete'
        });

        if (confirmed) {
            router.post(route('admin.users.destroy', id), {
                _method: 'DELETE',
                onSuccess: () => toast.success('User deleted successfully')
            });
        }
    };

    const handleOpenPermissionModal = (user) => {
        setSelectedUser(user);
        setUserPermissions(user.permissions.map(p => p.name));
        setIsPermissionModalOpen(true);
    };

    const handlePermissionToggle = (permName) => {
        setUserPermissions(prev => 
            prev.includes(permName) 
                ? prev.filter(p => p !== permName) 
                : [...prev, permName]
        );
    };

    const saveUserPermissions = () => {
        router.post(route('admin.users.sync-permissions', selectedUser.id), {
            permissions: userPermissions
        }, {
            onSuccess: () => {
                setIsPermissionModalOpen(false);
                toast.success('User-level permissions updated');
            }
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                setIsAddUserModalOpen(false);
                reset();
                toast.success('User created successfully');
            },
        });
    };

    const openModal = () => {
        clearErrors();
        reset();
        setIsAddUserModalOpen(true);
    };

    const filteredPermissionsBySearch = (perms) => {
        if (!searchTerm) return perms;
        return perms.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    return (
        <AdminLayout>
            <Head title="Platform Governance" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight">Identity Management</h2>
                    <p className="text-slate-400 mt-2 font-medium italic">Assign roles and individual capability overrides</p>
                </div>
                <button 
                    onClick={openModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-4 rounded-[2rem] font-black text-sm transition-all shadow-xl shadow-purple-900/40 active:scale-95"
                >
                    <UserPlus size={18} />
                    Onboard User
                </button>
            </div>

            <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-[#0f172a]/50 text-slate-300 uppercase font-black tracking-widest text-[10px]">
                        <tr>
                            <th className="px-10 py-8">Identity</th>
                            <th className="px-8 py-8">Authorized Roles</th>
                            <th className="px-8 py-8">Member Since</th>
                            <th className="px-10 py-8 text-right">System Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.data.map(user => (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/5 flex items-center justify-center text-slate-400 mr-5 group-hover:scale-110 transition-transform shadow-inner">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-lg leading-tight">{user.name}</div>
                                            <div className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-tight">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-8">
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles.map(role => (
                                            <span key={role.id} className={`inline-flex items-center px-4 py-1.5 bg-${role.name === 'admin' ? 'indigo' : role.name === 'super-admin' ? 'purple' : 'slate'}-500/10 text-${role.name === 'admin' ? 'indigo' : role.name === 'super-admin' ? 'purple' : 'slate'}-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-current/20`}>
                                                <Shield size={10} className="mr-2" /> {role.name}
                                            </span>
                                        ))}
                                        {user.permissions.length > 0 && (
                                            <span className="inline-flex items-center px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                <Key size={10} className="mr-2" /> +{user.permissions.length} Overrides
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-8 font-mono text-[10px] text-slate-500 tracking-widest">
                                    {new Date(user.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleOpenPermissionModal(user)}
                                            className="w-11 h-11 flex items-center justify-center bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all border border-emerald-500/20"
                                            title="Individual Overrides"
                                        >
                                            <Key size={18} />
                                        </button>
                                        <select 
                                            className="bg-[#0f172a] text-slate-300 text-[10px] font-black uppercase tracking-tight rounded-2xl border border-white/10 px-5 py-3 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                                            value={user.roles[0]?.name || ''}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            <option value="" disabled>Switch Role</option>
                                            {allRoles.map(r => (
                                                <option key={r.id} value={r.name}>{r.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={() => handleDelete(user.id)} 
                                            className="w-11 h-11 flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20" 
                                            title="Terminate Access"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {users.links && users.links.length > 3 && (
                <div className="mt-10 flex justify-center gap-3">
                    {users.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            onClick={() => link.url && router.visit(link.url)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                link.active 
                                ? 'bg-purple-600 text-white shadow-xl shadow-purple-900/30' 
                                : 'bg-[#1e293b] text-slate-400 hover:bg-[#2e3b52] hover:text-white border border-white/5'
                            } ${!link.url && 'opacity-30 cursor-not-allowed'}`}
                        />
                    ))}
                </div>
            )}

            {/* Direct Permissions Modal */}
            <Modal show={isPermissionModalOpen} onClose={() => setIsPermissionModalOpen(false)} maxWidth="2xl">
                <div className="p-10 bg-[#1e293b]">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-3xl font-black text-white italic">Override Access</h3>
                            <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">Assigning direct permissions to <span className="text-emerald-400">{selectedUser?.name}</span></p>
                        </div>
                        <button onClick={() => setIsPermissionModalOpen(false)} className="text-slate-500 hover:text-white transition-all p-3 hover:bg-white/5 rounded-2xl">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="mb-8 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text"
                            placeholder="Find capability..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0f172a] border-white/5 rounded-2xl py-4 pl-12 text-slate-300 focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto space-y-10 custom-scrollbar pr-2 text-left">
                        {Object.entries(permissionCategories).map(([category, perms]) => {
                            const filtered = filteredPermissionsBySearch(perms);
                            if (filtered.length === 0 && searchTerm) return null;

                            return (
                                <div key={category}>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                        <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                        {category}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {perms.map(permName => {
                                            const isAssigned = userPermissions.includes(permName);
                                            const isVisible = !searchTerm || permName.toLowerCase().includes(searchTerm.toLowerCase());
                                            
                                            if (!isVisible) return null;

                                            return (
                                                <button 
                                                    key={permName}
                                                    onClick={() => handlePermissionToggle(permName)}
                                                    className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 group ${
                                                        isAssigned 
                                                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                                                        : 'bg-[#0f172a] border-white/5 hover:border-white/10'
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                                        isAssigned ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-600'
                                                    }`}>
                                                        {isAssigned ? <Check size={14} strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-current rounded-full"></div>}
                                                    </div>
                                                    <div>
                                                        <div className={`text-[10px] font-black uppercase tracking-tight ${isAssigned ? 'text-white' : 'text-slate-400'}`}>
                                                            {permName.replace(/_/g, ' ')}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-end mt-12 pt-8 border-t border-white/5">
                        <PrimaryButton 
                            onClick={saveUserPermissions}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl px-12 py-5 font-black uppercase tracking-widest text-[10px] border-none shadow-xl shadow-emerald-900/20"
                        >
                            Sync Permissions
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Add User Modal */}
            <Modal show={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} maxWidth="md">
                <div className="p-10 bg-[#1e293b]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-3xl font-black text-white italic">Create Profile</h3>
                            <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-bold">New system identity</p>
                        </div>
                        <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-500 hover:text-white transition-all p-3 hover:bg-white/5 rounded-2xl">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-6 text-left">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <InputLabel htmlFor="name" value="Legal Name" className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-2 block w-full bg-[#0f172a] border-white/10 text-white rounded-2xl py-4 focus:ring-purple-500/50"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Enterprise Email" className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-2 block w-full bg-[#0f172a] border-white/10 text-white rounded-2xl py-4 focus:ring-purple-500/50"
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="mt-2 block w-full bg-[#0f172a] border-white/10 text-white rounded-2xl py-4 focus:ring-purple-500/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Verify" className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="mt-2 block w-full bg-[#0f172a] border-white/10 text-white rounded-2xl py-4 focus:ring-purple-500/50"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <InputError message={errors.password} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="role" value="Primary Role" className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2" />
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="mt-2 block w-full bg-[#0f172a] border-white/10 text-white rounded-2xl py-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-black text-xs uppercase tracking-tight"
                                    required
                                >
                                    {allRoles.filter(r => r.name !== 'super-admin').map(r => (
                                        <option key={r.id} value={r.name}>{r.name.toUpperCase()}</option>
                                    ))}
                                </select>
                                <InputError message={errors.role} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end mt-12">
                            <PrimaryButton className="w-full justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-3xl py-5 font-black tracking-widest text-[10px] uppercase shadow-2xl shadow-purple-900/40" disabled={processing}>
                                Finalize Identity
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AdminLayout>
    );
}
