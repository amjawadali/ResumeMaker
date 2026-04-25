import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Shield, Plus, X, Check, Save, Settings, Users as UsersIcon, FileText, Search, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '@/Components/Modal';
import { useState, useEffect, useMemo } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ roles, permissions }) {
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
    const [activeRoleId, setActiveRoleId] = useState(roles[0]?.id || null);
    const [rolePermissions, setRolePermissions] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const permissionCategories = {
        'System & Security': ['view_admin_dashboard', 'manage_settings', 'view_audit_logs'],
        'User Management': ['manage_users', 'manage_roles', 'manage_permissions', 'assign_roles'],
        'Content Moderation': ['manage_templates', 'moderate_content'],
        'Resume Activities': ['create_resume', 'edit_resume', 'delete_resume', 'download_resume']
    };

    // Initialize the permission state for each role
    useEffect(() => {
        const initialState = {};
        roles.forEach(role => {
            initialState[role.id] = role.permissions.map(p => p.name);
        });
        setRolePermissions(initialState);
    }, [roles]);

    const activeRole = roles.find(r => r.id === activeRoleId);

    const { data: roleData, setData: setRoleData, post: postRole, processing: processingRole, errors: roleErrors, reset: resetRole } = useForm({
        name: '',
    });

    const handlePermissionToggle = (roleId, permissionName) => {
        setRolePermissions(prev => {
            const current = prev[roleId] || [];
            const updated = current.includes(permissionName)
                ? current.filter(p => p !== permissionName)
                : [...current, permissionName];
            
            return { ...prev, [roleId]: updated };
        });
    };

    const savePermissions = () => {
        if (!activeRole) return;
        const permissionsForRole = rolePermissions[activeRoleId];
        
        router.post(route('admin.roles.sync-permissions', activeRoleId), {
            permissions: permissionsForRole
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Permissions for ${activeRole.name} updated`)
        });
    };

    const submitNewRole = (e) => {
        e.preventDefault();
        postRole(route('admin.roles.store'), {
            onSuccess: () => {
                setIsAddRoleModalOpen(false);
                resetRole();
                toast.success('Role created successfully');
            },
        });
    };

    const filteredPermissionsBySearch = (perms) => {
        if (!searchTerm) return perms;
        return perms.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    return (
        <AdminLayout>
            <Head title="Advanced Roles Management" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight">Access Control</h2>
                    <p className="text-slate-400 mt-2 font-medium italic">Configure advanced role-based capability levels</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => setIsAddRoleModalOpen(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-4 rounded-[2rem] font-black text-sm transition-all shadow-xl shadow-purple-900/30 active:scale-95"
                    >
                        <Plus size={18} />
                        New Role
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Role Selection & Search */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 block">Select Role to Configure</label>
                        <div className="space-y-3">
                            {roles.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => setActiveRoleId(role.id)}
                                    className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                                        activeRoleId === role.id 
                                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40' 
                                        : 'bg-[#0f172a] border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 text-sm font-black uppercase tracking-tight">
                                        <Shield size={16} />
                                        {role.name}
                                    </div>
                                    <ChevronRight size={16} className={activeRoleId === role.id ? 'opacity-100' : 'opacity-20'} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text"
                                placeholder="Search permissions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0f172a] border-none rounded-2xl py-4 pl-12 text-slate-300 focus:ring-2 focus:ring-purple-500/50 transition-all text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Permission Editor */}
                <div className="lg:col-span-8">
                    {activeRole ? (
                        <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col h-full">
                            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Capabilities</h3>
                                    <p className="text-slate-400 text-sm mt-1">Configuring permissions for <span className="text-purple-400 font-bold">{activeRole.name.toUpperCase()}</span></p>
                                </div>
                                {activeRole.name !== 'super-admin' && (
                                    <button 
                                        onClick={savePermissions}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                                    >
                                        <Save size={18} /> Update Access
                                    </button>
                                )}
                                {activeRole.name === 'super-admin' && (
                                    <div className="px-6 py-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                        UNRESTRICTED ACCESS
                                    </div>
                                )}
                            </div>

                            <div className="p-10 flex-grow max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-12">
                                    {Object.entries(permissionCategories).map(([category, perms]) => {
                                        const filtered = filteredPermissionsBySearch(perms);
                                        if (filtered.length === 0 && searchTerm) return null;

                                        return (
                                            <div key={category}>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{category}</h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {perms.map(permName => {
                                                        const isAssigned = rolePermissions[activeRoleId]?.includes(permName) || activeRole.name === 'super-admin';
                                                        const isVisible = !searchTerm || permName.toLowerCase().includes(searchTerm.toLowerCase());
                                                        
                                                        if (!isVisible) return null;

                                                        return (
                                                            <div 
                                                                key={permName}
                                                                onClick={() => activeRole.name !== 'super-admin' && handlePermissionToggle(activeRoleId, permName)}
                                                                className={`p-5 rounded-[1.5rem] border cursor-pointer transition-all flex items-center justify-between group ${
                                                                    isAssigned 
                                                                    ? 'bg-purple-500/10 border-purple-500/30' 
                                                                    : 'bg-[#0f172a] border-white/5 hover:border-white/10'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                                                        isAssigned ? 'bg-purple-500 text-white shadow-lg shadow-purple-900/40' : 'bg-white/5 text-slate-600'
                                                                    }`}>
                                                                        {isAssigned ? <Check size={18} strokeWidth={3} /> : <X size={18} />}
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <div className={`text-xs font-black uppercase tracking-tight ${isAssigned ? 'text-white' : 'text-slate-400'}`}>
                                                                            {permName.replace(/_/g, ' ')}
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-600 mt-0.5 font-mono">{permName}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-[#1e293b]/30 backdrop-blur-xl rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <Shield size={40} className="text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-400">Select a role to start configuring access control</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Role Modal */}
            <Modal show={isAddRoleModalOpen} onClose={() => setIsAddRoleModalOpen(false)} maxWidth="sm">
                <div className="p-10 bg-[#1e293b]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-3xl font-black text-white italic tracking-tight">New Role</h3>
                            <p className="text-sm text-slate-400 mt-1">Specify a unique identifier for the role</p>
                        </div>
                        <button onClick={() => setIsAddRoleModalOpen(false)} className="text-slate-500 hover:text-white transition-all p-3 hover:bg-white/5 rounded-2xl">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={submitNewRole} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Internal Role Key" className="text-xs text-slate-400 uppercase tracking-widest font-black mb-2" />
                            <TextInput
                                id="name"
                                value={roleData.name}
                                onChange={(e) => setRoleData('name', e.target.value)}
                                className="mt-2 block w-full bg-[#0f172a] border-white/10 text-white rounded-2xl py-5 px-6 focus:ring-purple-500/50"
                                placeholder="e.g. content_moderator"
                                required
                            />
                            <InputError message={roleErrors.name} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end mt-12">
                            <PrimaryButton className="w-full justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-3xl py-5 font-black tracking-[0.2em] text-xs uppercase shadow-2xl shadow-purple-900/40 border-none transition-all active:scale-95" disabled={processingRole}>
                                Authorize Role Access
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AdminLayout>
    );
}
