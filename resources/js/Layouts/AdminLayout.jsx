import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1e293b] border-r border-white/5 flex flex-col fixed inset-y-0 z-50">
                <div className="p-8">
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase">Admin<span className="text-purple-500">Panel</span></h1>
                </div>

                <nav className="flex-grow px-4 space-y-2">
                    <Link href={route('admin.dashboard')} className={`flex items-center px-4 py-3 rounded-xl font-bold transition-all ${route().current('admin.dashboard') ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <LayoutDashboard size={20} className="mr-3" /> Dashboard
                    </Link>
                    <Link href={route('admin.templates.index')} className={`flex items-center px-4 py-3 rounded-xl font-bold transition-all ${route().current('admin.templates.*') ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <FileText size={20} className="mr-3" /> Templates
                    </Link>
                    <Link href={route('admin.users.index')} className={`flex items-center px-4 py-3 rounded-xl font-bold transition-all ${route().current('admin.users.*') ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <Users size={20} className="mr-3" /> Users
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <Link href={route('logout')} method="post" as="button" className="flex items-center px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-bold w-full transition-all">
                        <LogOut size={20} className="mr-3" /> Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow ml-64 p-10">
                {children}
            </main>
        </div>
    );
}
