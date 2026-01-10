import { Link } from '@inertiajs/react';
import { Home, Undo, Redo, Cloud, ChevronDown, Share2, Download, Menu } from 'lucide-react';

export default function EditorNavbar({ resumeTitle, onTitleChange, saving, onDownload, onDelete, onUndo, onRedo, canUndo, canRedo }) {
    return (
        <div className="h-14 bg-gradient-to-r from-[#00C4CC] via-[#7D2AE8] to-[#7D2AE8] text-white flex items-center justify-between px-4 select-none shrink-0 z-50 shadow-md">
            {/* Left Section: Home & Menu */}
            <div className="flex items-center gap-4">
                <Link href={route('dashboard')} className="hover:opacity-80 transition-opacity">
                    <Home size={20} />
                </Link>
                <div className="h-6 w-px bg-white/20 mx-1"></div>
                <div className="flex items-center gap-4 text-sm font-bold">
                    <button className="hover:opacity-100 opacity-80 transition-opacity">File</button>
                    <button className="hover:opacity-100 opacity-80 transition-opacity">Resize</button>
                    <button
                        onClick={onDelete}
                        className="text-red-200 hover:text-red-100 transition-colors ml-4 text-[10px] uppercase tracking-wider font-black"
                    >
                        Delete Design
                    </button>
                </div>
            </div>

            {/* Center Section: Undo/Redo & Title */}
            <div className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
                <div className="hidden md:flex items-center gap-2 mr-4">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className={`p-1.5 rounded transition-colors ${canUndo ? 'hover:bg-white/10' : 'opacity-30 cursor-not-allowed'}`}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo size={18} />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className={`p-1.5 rounded transition-colors ${canRedo ? 'hover:bg-white/10' : 'opacity-30 cursor-not-allowed'}`}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo size={18} />
                    </button>
                </div>
                <div className="flex items-center gap-2 group">
                    <Cloud size={16} className={`text-white/70 ${saving ? 'animate-pulse' : ''}`} />
                    <span className="text-xs text-white/70 font-medium hidden sm:block">
                        {saving ? 'Saving...' : 'All changes saved'}
                    </span>
                </div>
            </div>

            {/* Right Section: Title, User, Share */}
            <div className="flex items-center gap-3">
                <input
                    type="text"
                    value={resumeTitle}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="bg-transparent border-none text-white font-bold text-sm focus:ring-1 focus:ring-white/50 rounded px-2 w-32 md:w-48 text-right md:text-left truncate"
                    placeholder="Untitled Design"
                />

                <div className="h-8 w-8 rounded-full bg-purple-900 border-2 border-white/20 flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
                    JD
                </div>

                <div className="h-6 w-px bg-white/20 mx-1"></div>

                <button
                    onClick={onDownload}
                    className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-md font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg"
                >
                    <Share2 size={16} />
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
}
