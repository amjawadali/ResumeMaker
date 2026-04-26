import { Link } from '@inertiajs/react';
import { Home, Undo, Redo, Cloud, ChevronDown, Share2, Download, Menu, Trash2, Check, UploadCloud, FileImage, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function EditorNavbar({ resumeTitle, onTitleChange, saving, onDownload, onDelete, onUndo, onRedo, canUndo, canRedo, onHistoryClick, onPublish, onExport, mode }) {
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
        };
        if (exportOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [exportOpen]);
    return (
        <div className="h-14 bg-[#0e1217] text-white flex items-center justify-between px-4 select-none shrink-0 z-50 shadow-md border-b border-white/5">
            {/* Left Section: Home & Menu */}
            <div className="flex items-center gap-4">
                <Link href={route('dashboard')} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
                    <Home size={20} className="text-gray-300" />
                </Link>
                <div className="h-6 w-px bg-white/10 mx-1"></div>
                <div className="flex items-center gap-3 text-sm font-semibold">
                    <button className="text-gray-300 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded transition-all">File</button>

                    <div className="w-px h-4 bg-white/5 mx-1"></div>

                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all group"
                        title="Delete Design"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Center Section: Status & History */}
            <div className="flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-1">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className={`p-1.5 rounded-lg transition-colors ${canUndo ? 'hover:bg-white/10 text-gray-300' : 'text-gray-600 cursor-not-allowed'}`}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo size={18} />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className={`p-1.5 rounded-lg transition-colors ${canRedo ? 'hover:bg-white/10 text-gray-300' : 'text-gray-600 cursor-not-allowed'}`}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo size={18} />
                    </button>
                </div>

                <div className="w-px h-4 bg-white/10 mx-1"></div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onHistoryClick}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/10 rounded-xl transition-all duration-200 group border border-transparent hover:border-white/5"
                        title="View Version History"
                    >
                        <div className="relative flex items-center justify-center">
                            {saving ? (
                                <div className="relative">
                                    <Cloud size={22} className="text-purple-400/50 animate-pulse" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" />
                                    </div>
                                </div>
                            ) : (
                                <div className="relative flex items-center justify-center">
                                    <Cloud size={22} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" fill="white" />
                                    <div className="absolute inset-0 flex items-center justify-center mt-[1px]">
                                        <Check size={10} className="text-[#0e1217] stroke-[4px]" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <span className="text-[11px] font-semibold text-gray-400 group-hover:text-white transition-colors tracking-tight">
                            {saving ? 'Saving...' : 'All changes saved'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Right Section: Title, User, Share */}
            <div className="flex items-center gap-4">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={resumeTitle}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="bg-transparent border-none text-gray-200 font-bold text-sm focus:ring-0 hover:bg-white/5 rounded px-2 py-1.5 w-32 md:w-48 transition-colors text-right md:text-left truncate"
                        placeholder="Untitled Design"
                    />
                </div>

                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border border-white/20 flex items-center justify-center text-[10px] font-black shadow-lg">
                    JD
                </div>

                <div className="h-6 w-px bg-white/10 mx-1"></div>

                {mode === 'developer' && (
                    <button
                        onClick={onPublish}
                        className="flex items-center gap-2 bg-[#7D2AE8] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#6a24c5] active:scale-95 transition-all shadow-lg shadow-purple-900/20"
                    >
                        <UploadCloud size={16} />
                        <span>Publish</span>
                    </button>
                )}

                <div className="relative" ref={exportRef}>
                    <button
                        onClick={() => setExportOpen(!exportOpen)}
                        className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all shadow-md"
                    >
                        <Download size={16} />
                        <span>Download</span>
                        <ChevronDown size={14} className={`ml-1 transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {exportOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Export</div>
                            <button onClick={() => { onExport?.('png'); setExportOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors text-left">
                                <FileImage size={16} className="text-purple-500" />
                                <span>PNG Image</span>
                            </button>
                            <button onClick={() => { onExport?.('jpg'); setExportOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors text-left">
                                <FileImage size={16} className="text-blue-500" />
                                <span>JPG Image</span>
                            </button>
                            <button onClick={() => { onExport?.('pdf'); setExportOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors text-left">
                                <FileText size={16} className="text-red-500" />
                                <span>PDF Document</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
