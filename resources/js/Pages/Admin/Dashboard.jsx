import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, FileText, Activity, TrendingUp, TrendingDown, Clock, Shield, PlusCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, growth, icon: Icon, color }) => {
    const isPositive = growth >= 0;
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#1e293b]/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-2xl"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <Icon size={120} className={color} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 ${color}`}>
                            <Icon size={24} />
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(growth)}%
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</span>
                    <div className="text-5xl font-black text-white mt-1 italic tracking-tighter">{value}</div>
                </div>
            </div>
        </motion.div>
    );
};

export default function Dashboard({ stats, trends, activities, recent_users, recent_resumes, popular_templates }) {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0f172a] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-purple-400">Users: <span className="text-white">{payload[0].value}</span></p>
                        <p className="text-sm font-bold text-emerald-400">Resumes: <span className="text-white">{payload[1]?.value || 0}</span></p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const getEventIcon = (event) => {
        switch (event) {
            case 'created': return <PlusCircle className="text-emerald-500" size={14} />;
            case 'updated': return <Activity className="text-blue-500" size={14} />;
            case 'deleted': return <XCircle className="text-red-500" size={14} />;
            default: return <AlertCircle className="text-purple-500" size={14} />;
        }
    };

    return (
        <AdminLayout>
            <Head title="Command Center" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase">Command <span className="text-purple-500">Center</span></h2>
                    <p className="text-slate-400 mt-2 font-medium tracking-wide">Real-time platform synchronization & analytical intelligence.</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-3xl border border-white/5">
                    <div className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-900/40">Real-time</div>
                    <div className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest">Historical</div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <StatCard 
                    title="User Network" 
                    value={stats.total_users.value} 
                    growth={stats.total_users.growth} 
                    icon={Users} 
                    color="text-purple-500" 
                />
                <StatCard 
                    title="Resume Output" 
                    value={stats.total_resumes.value} 
                    growth={stats.total_resumes.growth} 
                    icon={FileText} 
                    color="text-emerald-500" 
                />
                <StatCard 
                    title="System Templates" 
                    value={stats.total_templates} 
                    growth={0} // Placeholder until we have history
                    icon={Shield} 
                    color="text-indigo-500" 
                />
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-[#1e293b]/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-center"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Activity size={24} />
                        </div>
                        <div className="flex-grow">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operational Status</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-black text-white uppercase">Sync Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-4 italic">
                        Node v4.2.0-LTS Running Optimal
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
                {/* Main Graph Area */}
                <div className="xl:col-span-8">
                    <div className="bg-[#1e293b]/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-2xl h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Registration Pulse</h3>
                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">14-Day Activity Correlation</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                    <span className="text-[10px] font-black text-white uppercase">Users</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-black text-white uppercase">Resumes</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#475569', fontSize: 10, fontWeight: 800}}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#475569', fontSize: 10, fontWeight: 800}}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{stroke: '#ffffff22', strokeWidth: 1}} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="users" 
                                        stroke="#8b5cf6" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorUsers)" 
                                        animationDuration={2000}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="resumes" 
                                        stroke="#10b981" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorResumes)" 
                                        animationDuration={2500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Sidebar */}
                <div className="xl:col-span-4">
                    <div className="bg-[#1e293b]/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 shadow-2xl h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">System Feed</h3>
                            <button className="text-[10px] font-black text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors">Clear</button>
                        </div>

                        <div className="flex-grow space-y-6 overflow-y-auto max-h-[450px] custom-scrollbar pr-2">
                            {activities.length > 0 ? activities.map((log) => (
                                <div key={log.id} className="group relative flex gap-4 p-4 rounded-2xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                            {getEventIcon(log.event)}
                                        </div>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-black text-white uppercase tracking-tight">{log.causer_name}</span>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase flex items-center gap-1">
                                                <Clock size={8} /> {log.time}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                            <span className="font-bold text-purple-400 capitalize">{log.event}</span> {log.description.replace(log.event, '')}
                                        </p>
                                        <div className="mt-2 text-[8px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded w-fit border border-white/5">
                                            {log.subject_type}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                                    <Activity size={40} className="mb-4" />
                                    No activity recorded
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <Link href="#" className="flex items-center justify-center w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all">
                                View Universal Audit Logs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Templates Row */}
                <div className="bg-[#1e293b]/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">High-Performance Templates</h3>
                        <Link href={route('admin.templates.index')} className="text-[10px] font-black text-purple-400 uppercase tracking-widest hover:text-purple-300">View Catalog</Link>
                    </div>
                    <div className="space-y-4">
                        {popular_templates.map((template) => (
                            <div key={template.id} className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border border-white/10">
                                        <img src={template.preview_image} className="w-full h-full object-cover opacity-50" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white italic">{template.name}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{template.category}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-white tracking-widest">{template.resumes_count}</div>
                                    <div className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Utilizations</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Queue / Recent Resumes */}
                <div className="bg-[#1e293b]/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Output Stream</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Flow</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <tr>
                                    <th className="pb-4 pr-4">Identitiy</th>
                                    <th className="pb-4 pr-4 text-right">Synchronization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recent_resumes.map(resume => (
                                    <tr key={resume.id} className="group">
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white leading-tight">{resume.title}</div>
                                                    <div className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter truncate max-w-[150px]">{resume.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 pl-4 text-right">
                                            <div className="text-[10px] font-black text-white italic tracking-tighter">{resume.template.name.toUpperCase()}</div>
                                            <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Approved Node</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
