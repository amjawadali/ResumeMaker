import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Users, FileText, Activity } from 'lucide-react';

export default function Dashboard({ stats }) {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="mb-10">
                <h2 className="text-3xl font-black text-white tracking-tight">System Overview</h2>
                <p className="text-slate-400">Real-time platform metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                {/* Stats Cards */}
                <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={64} className="text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Total Users</span>
                        <div className="text-5xl font-black text-white mt-2">{stats.total_users}</div>
                    </div>
                </div>

                <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText size={64} className="text-pink-500" />
                    </div>
                    <div className="relative z-10">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Active Resumes</span>
                        <div className="text-5xl font-black text-white mt-2">{stats.total_resumes}</div>
                    </div>
                </div>

                <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={64} className="text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">System Activity</span>
                        <div className="text-xl font-bold text-white mt-4 flex items-center">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                            Online
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table (Placeholder) */}
            <div className="bg-[#1e293b] rounded-[2rem] border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5">
                    <h3 className="text-xl font-black text-white">Recent Registrations</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-white/5 text-slate-300 uppercase font-black tracking-widest text-xs">
                            <tr>
                                <th className="px-8 py-4">User</th>
                                <th className="px-8 py-4">Email</th>
                                <th className="px-8 py-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats.recent_users && stats.recent_users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-4 font-bold text-white">{user.name}</td>
                                    <td className="px-8 py-4">{user.email}</td>
                                    <td className="px-8 py-4 font-dosis">{user.created_at}</td>
                                </tr>
                            ))}
                            {(!stats.recent_users || stats.recent_users.length === 0) && (
                                <tr><td colSpan="3" className="px-8 py-8 text-center opacity-50">No data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
