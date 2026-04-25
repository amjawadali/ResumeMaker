import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Users, FileText, LogOut, ShieldCheck, ChevronLeft, ChevronRight, Bell, Search, Activity, Cpu, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export default function AdminLayout({ children }) {
    const { auth, notifications } = usePage().props;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: route('admin.dashboard'), active: route().current('admin.dashboard') },
        { name: 'Templates', icon: FileText, href: route('admin.templates.index'), active: route().current('admin.templates.*') },
        { name: 'Users', icon: Users, href: route('admin.users.index'), active: route().current('admin.users.*') },
        { name: 'Roles', icon: ShieldCheck, href: route('admin.roles.index'), active: route().current('admin.roles.*') },
    ];

    return (
        <div className="min-h-screen bg-[#070b14] text-slate-300 font-sans flex overflow-x-hidden">
            {/* Sidebar (same as before) */}
            <motion.aside 
                initial={false}
                animate={{ width: isCollapsed ? 120 : 300 }}
                className="bg-[#0f172a]/80 backdrop-blur-3xl border-r border-white/5 flex flex-col fixed inset-y-0 z-50 transition-colors shadow-2xl"
            >
                <div className="p-8 flex items-center justify-between">
                    {!isCollapsed && (
                        <motion.h1 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl font-black text-white tracking-widest uppercase italic"
                        >
                            AD<span className="text-purple-500">MIN</span>
                        </motion.h1>
                    )}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400 border border-white/5 group"
                    >
                        {isCollapsed ? <ChevronRight size={18} className="group-hover:scale-110 transition-transform" /> : <ChevronLeft size={18} className="group-hover:scale-110 transition-transform" />}
                    </button>
                </div>

                <nav className="flex-grow px-6 space-y-3 mt-4">
                    {navItems.map((item) => (
                        <Link 
                            key={item.name}
                            href={item.href} 
                            className={`group flex items-center ${isCollapsed ? 'justify-center py-4' : 'px-6 py-4'} rounded-[1.5rem] font-black tracking-widest text-[10px] uppercase transition-all relative overflow-hidden ${
                                item.active 
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-900/30' 
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <item.icon size={20} className={`${item.active ? 'text-white' : 'group-hover:text-purple-400'} transition-colors ${!isCollapsed && 'mr-4'}`} />
                            {!isCollapsed && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>{item.name}</motion.span>}
                            
                            {item.active && (
                                <motion.div 
                                    layoutId="activeGlow"
                                    className="absolute inset-0 bg-white/10 opacity-50 blur-xl rounded-full"
                                />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-6">
                    <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all"></div>
                        
                        {!isCollapsed ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">
                                    <span>System Health</span>
                                    <span className="text-emerald-500">98% Optimal</span>
                                </div>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '98%' }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-purple-400">
                                        <Activity size={18} />
                                    </div>
                                    <div className="text-[10px] font-bold text-white uppercase tracking-tight">Active Engine</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <Activity size={18} className="text-emerald-500" />
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                        <Link href={route('logout')} method="post" as="button" className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} py-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-[1.5rem] font-black tracking-widest text-[10px] uppercase w-full transition-all border border-transparent hover:border-red-500/20`}>
                            <LogOut size={20} className={!isCollapsed ? 'mr-4' : ''} />
                            {!isCollapsed && "Terminate Session"}
                        </Link>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col transition-all duration-300" style={{ marginLeft: isCollapsed ? 120 : 300 }}>
                {/* Global Header */}
                <header className={`sticky top-0 z-40 px-10 py-6 transition-all duration-300 ${scrolled ? 'bg-[#070b14]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center bg-white/5 rounded-2xl px-6 py-3 border border-white/5 w-96 group focus-within:border-purple-500/50 transition-all">
                            <Search size={18} className="text-slate-500 mr-4 group-focus-within:text-purple-400" />
                            <input 
                                type="text" 
                                placeholder="Universal system search..."
                                className="bg-transparent border-none text-xs font-medium text-white placeholder-slate-600 focus:ring-0 w-full"
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Notification Hub */}
                            <div className="relative" ref={notificationRef}>
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all border border-white/5 ${showNotifications ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                                >
                                    <Bell size={20} />
                                    {notifications?.total_alerts > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-[#070b14] flex items-center justify-center">
                                            {notifications.total_alerts}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute right-0 mt-4 w-96 bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl shadow-purple-900/20 overflow-hidden backdrop-blur-3xl z-[60]"
                                        >
                                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                                <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Signal Hub</h3>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Real-time Stream</span>
                                            </div>

                                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                                                {/* Approvals Section */}
                                                {(notifications?.items?.approvals?.length > 0 || notifications?.items?.deletions?.length > 0) ? (
                                                    <div className="p-6">
                                                        <div className="text-[8px] font-black text-purple-500 uppercase tracking-[0.3em] mb-4">Urgent Actions</div>
                                                        <div className="space-y-4">
                                                            {notifications.items.approvals.map(template => (
                                                                <Link 
                                                                    key={template.id}
                                                                    href={route('admin.moderation.index')}
                                                                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                                                                >
                                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                                                        <CheckCircle size={18} />
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <div className="text-[10px] font-black text-white uppercase tracking-tight">Template Approval</div>
                                                                        <div className="text-[9px] text-slate-500 mt-1 italic">"{template.name}" needs review</div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                            {notifications.items.deletions.map(template => (
                                                                <Link 
                                                                    key={template.id}
                                                                    href={route('admin.moderation.index')}
                                                                    className="flex items-center gap-4 p-4 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-500/10 transition-all group"
                                                                >
                                                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                                                                        <Trash2 size={18} />
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <div className="text-[10px] font-black text-white uppercase tracking-tight text-red-400">Deletion Request</div>
                                                                        <div className="text-[9px] text-slate-500 mt-1 italic">"{template.name}" removal task</div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {/* System Activity */}
                                                <div className="p-6 bg-white/[0.02]">
                                                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Pulse Log</div>
                                                    <div className="space-y-4">
                                                        {notifications?.items?.activity?.map(act => (
                                                            <div key={act.id} className="flex gap-4 p-4 rounded-xl border border-transparent">
                                                                <div className="mt-1">
                                                                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <div className="text-[9px] font-bold text-slate-300 leading-relaxed uppercase tracking-tight">{act.description}</div>
                                                                    <div className="mt-2 flex items-center justify-between">
                                                                        <span className="text-[8px] font-black text-purple-500/50 uppercase tracking-widest">{act.causer}</span>
                                                                        <span className="text-[8px] text-slate-600 font-bold uppercase flex items-center gap-1">
                                                                            <Clock size={8} /> {act.time}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {notifications?.items?.activity?.length === 0 && (
                                                            <div className="text-[10px] text-slate-600 italic text-center py-4">No recent signals detected</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 border-t border-white/5 bg-black/20">
                                                <Link href={route('admin.dashboard')} className="block w-full text-center py-3 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">
                                                    Open System Console
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                                <div className="text-right">
                                    <div className="text-xs font-black text-white italic tracking-tighter uppercase">{auth.user.name}</div>
                                    <div className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Global Admin</div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-900/20">
                                    <div className="w-full h-full rounded-[0.9rem] bg-slate-900 flex items-center justify-center font-black text-white text-sm">
                                        {auth.user.name.charAt(0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-10 flex-grow animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </main>

                <footer className="px-10 py-8 border-t border-white/5 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex justify-between items-center bg-white/[0.01]">
                    <span>&copy; 2026 ResumeMaker Pro Engine</span>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-purple-400 transition-colors">Core Nodes</a>
                        <a href="#" className="hover:text-purple-400 transition-colors">Compliance</a>
                        <a href="#" className="hover:text-purple-400 transition-colors">v4.2.0-LTS</a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
