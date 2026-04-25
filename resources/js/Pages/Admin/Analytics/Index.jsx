import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    TrendingUp, Users, Target, Download, 
    BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
    MousePointer2, Eye, LayoutTemplate, Sparkles
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

export default function Index({ auth, stats, funnelData, topTemplates }) {
    
    const overviewStats = [
        { label: 'Impressions', value: stats.total_impressions, icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Engagements', value: stats.total_engagements, icon: MousePointer2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Usage', value: stats.total_usage, icon: LayoutTemplate, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { label: 'Conversions', value: stats.total_exports, icon: Download, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Platform Analytics" />

            <div className="py-12 px-6 lg:px-12 bg-[#0E1318] min-h-screen text-white">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                                <BarChart3 size={14} className="text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Insights & Growth</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">Platform Analytics</h1>
                            <p className="text-slate-400 font-medium">Tracking marketplace engagement and template conversions.</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {overviewStats.map((stat, i) => (
                            <div key={i} className="bg-slate-800/40 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <stat.icon size={64} />
                                </div>
                                <div className="space-y-4">
                                    <div className={`p-3 rounded-2xl w-fit ${stat.bg} ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-tight">{stat.label}</h3>
                                        <div className="text-3xl font-black mt-1">
                                            {stat.value.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* 30 Day Conversion Trend */}
                        <div className="lg:col-span-2 bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black flex items-center gap-2">
                                    <TrendingUp size={20} className="text-purple-400" />
                                    Conversion Trend (30 Days)
                                </h2>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={funnelData}>
                                        <defs>
                                            <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                        <YAxis stroke="#64748b" fontSize={10} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="engagements" stroke="#818cf8" fillOpacity={1} fill="url(#colorEngage)" />
                                        <Area type="monotone" dataKey="usage" stroke="#fbbf24" fillOpacity={0} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Conversion Summary Stats */}
                        <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                            <h2 className="text-xl font-black flex items-center gap-2">
                                <Target size={20} className="text-amber-400" />
                                Efficiency
                            </h2>
                            
                            <div className="space-y-6">
                                <EfficiencyCard 
                                    label="Engagement Rate" 
                                    value={stats.total_impressions > 0 ? (stats.total_engagements / stats.total_impressions * 100).toFixed(1) : 0} 
                                    subtext="Views to Clicks"
                                    color="bg-purple-500"
                                />
                                <EfficiencyCard 
                                    label="Usage Rate" 
                                    value={stats.total_engagements > 0 ? (stats.total_usage / stats.total_engagements * 100).toFixed(1) : 0} 
                                    subtext="Clicks to Edits"
                                    color="bg-amber-500"
                                />
                                <EfficiencyCard 
                                    label="Export Rate" 
                                    value={stats.total_usage > 0 ? (stats.total_exports / stats.total_usage * 100).toFixed(1) : 0} 
                                    subtext="Edits to Exports"
                                    color="bg-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Top Templates Table */}
                    <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black flex items-center gap-2">
                                <Sparkles size={20} className="text-blue-400" />
                                Best Performing Templates
                            </h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-4 px-4 text-xs font-black uppercase tracking-widest text-slate-500">Template</th>
                                        <th className="pb-4 px-4 text-xs font-black uppercase tracking-widest text-slate-500">Author</th>
                                        <th className="pb-4 px-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center">Impressions</th>
                                        <th className="pb-4 px-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center">Used</th>
                                        <th className="pb-4 px-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Conversion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topTemplates.map((template, i) => (
                                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-6 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-16 bg-white rounded-lg overflow-hidden border border-white/10 shrink-0">
                                                        <img src={template.preview_image} className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="font-black text-white">{template.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 text-sm font-bold text-slate-400">
                                                {template.user?.name || 'ResumeMaker'}
                                            </td>
                                            <td className="py-6 px-4 text-center font-bold text-slate-300">
                                                {template.impressions_count.toLocaleString()}
                                            </td>
                                            <td className="py-6 px-4 text-center font-bold text-slate-300">
                                                {template.usage_count_real.toLocaleString()}
                                            </td>
                                            <td className="py-6 px-4 text-right">
                                                <span className={`px-3 py-1.5 rounded-xl font-black text-xs ${
                                                    template.conversion_rate > 10 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                                    template.conversion_rate > 5 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                                }`}>
                                                    {template.conversion_rate.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function EfficiencyCard({ label, value, subtext, color }) {
    return (
        <div className="space-y-3">
            <div className="flex items-end justify-between">
                <div>
                    <h4 className="text-sm font-black text-white">{label}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{subtext}</p>
                </div>
                <div className="text-xl font-black">{value}%</div>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ${color}`}
                    style={{ width: `${Math.min(100, value)}%` }}
                />
            </div>
        </div>
    );
}
