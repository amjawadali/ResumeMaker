import { LayoutTemplate, Shapes, Type, UploadCloud, FolderOpen } from 'lucide-react';

export default function EditorSidebar({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'design', label: 'Design', icon: LayoutTemplate },
        { id: 'elements', label: 'Elements', icon: Shapes },
        { id: 'text', label: 'Text', icon: Type },
        { id: 'uploads', label: 'Uploads', icon: UploadCloud },
        { id: 'projects', label: 'Projects', icon: FolderOpen },
    ];

    return (
        <div className="w-[72px] bg-[#0E1318] flex flex-col items-center py-4 gap-1 z-30 shrink-0 h-full border-r border-white/5">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id === activeTab ? null : tab.id)}
                    className={`w-full flex flex-col items-center justify-center py-3 gap-1.5 transition-all relative group ${activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    {/* Active Indicator Line (Left) */}
                    {activeTab === tab.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-purple-500 rounded-r-full"></div>
                    )}

                    {/* Background Pill for Active (Optional - Canva style uses plain bg or active text) */}
                    {activeTab === tab.id && (
                        <div className="absolute inset-0 bg-white/5 mx-2 rounded-lg -z-10"></div>
                    )}

                    <tab.icon size={24} strokeWidth={1.5} className={activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
                    <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
