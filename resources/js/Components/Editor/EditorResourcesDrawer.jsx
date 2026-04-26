import React, { useState, useEffect, useRef } from 'react';
import {
    X, Search, Image as ImageIcon, Type, Square, Upload, Loader2, Trash2, Circle, Triangle, Star, ArrowRight, Minus, Hexagon, History, RotateCcw, Plus, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Languages, Palette, Layers, Layout, Monitor, Smile,
    Globe, Linkedin, Github, Twitter, Facebook, Instagram, Users, UserPlus, UserCheck, Heart, ThumbsUp, Medal, Crown, Code, Terminal, Database, Server, Cloud, Wifi, Cpu, Smartphone, BookOpen, Book, Library, PenTool, Edit, FileText, Clipboard, CheckCircle, Calendar,
    Youtube, Slack, Twitch, Send, Share, Download, Bell, Settings, Coffee, Pizza, Utensils, Plane, Car, Camera, Music, Video, Tv, Gamepad, File, Folder, Check, HelpCircle, Info,
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowLeft, Move, ExternalLink, CreditCard, Banknote, PieChart, BarChart, TrendingUp, TrendingDown, DollarSign, Euro, ShoppingCart, ShoppingBag
} from 'lucide-react';

export default function EditorResourcesDrawer({
    activeTab,
    onAddElement,
    onUpload,
    onDeleteUpload,
    isUploading,
    userUploads = [],
    onClose,
    versions = [],
    onSaveVersion,
    onRestoreVersion,
    onDeleteVersion,
    profile = null,
    pages = [],
    onUpdatePage,
    canvasWidth,
    canvasHeight,
    onCanvasResize
}) {
    if (!activeTab) return null;

    const [newVersionName, setNewVersionName] = useState('');
    const [iconSearchQuery, setIconSearchQuery] = useState('');
    const [photoSearchQuery, setPhotoSearchQuery] = useState('');
    const drawerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (activeTab) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeTab, onClose]);

    const iconComponents = {
        Mail, Phone, MapPin, Globe, Linkedin, Github, Twitter, Facebook, Instagram,
        User, Users, UserPlus, UserCheck, Star, Heart, ThumbsUp, Award, Medal, Crown,
        Briefcase, Code, Terminal, Database, Server, Cloud, Wifi, Cpu, Monitor, Smartphone,
        GraduationCap, BookOpen, Book, Library, PenTool, Edit, FileText, Clipboard, CheckCircle, Calendar,
        Youtube, Slack, Twitch, Send, Share, Download, Bell, Settings, Coffee, Pizza, Utensils, Plane, Car, Camera, Music, Video, Tv, Gamepad, File, Folder, Check, HelpCircle, Info,
        ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Move, ExternalLink, CreditCard, Banknote, PieChart, BarChart, TrendingUp, TrendingDown, DollarSign, EuroSign: Euro, ShoppingCart, ShoppingBag
    };

    return (
        <div ref={drawerRef} className={`fixed top-[64px] left-[72px] bottom-4 ${activeTab === 'history' ? 'w-[600px]' : 'w-80'} bg-[#18191B] border border-white/10 rounded-xl shadow-2xl flex flex-col z-[30] overflow-hidden transition-all duration-300 animate-in slide-in-from-left`}>
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <h2 className="font-bold text-white capitalize">{activeTab === 'history' ? 'Version History' : activeTab}</h2>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                </button>
            </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pt-0 custom-scrollbar">
            {activeTab === 'icons' && (
                <div className="px-0 mb-4 mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            value={iconSearchQuery}
                            onChange={(e) => setIconSearchQuery(e.target.value)}
                            placeholder={`Search icons...`}
                            className="w-full bg-[#252627] border-none rounded-md py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-purple-500 text-white"
                        />
                    </div>
                </div>
            )}
                {activeTab === 'history' && (
                    <div className="flex flex-col h-full">
                        <div className="mb-6 space-y-3 pt-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newVersionName}
                                    onChange={(e) => setNewVersionName(e.target.value)}
                                    placeholder="Enter version name..."
                                    className="flex-1 bg-[#252627] border-white/5 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500"
                                />
                                <button
                                    onClick={() => {
                                        onSaveVersion(newVersionName);
                                        setNewVersionName('');
                                    }}
                                    className="p-2 bg-purple-600 hover:bg-purple-500 rounded-md text-white transition-colors"
                                    title="Save current state as a new version"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 px-1 italic">
                                Save the current canvas state to restore it later at any time.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Previous Versions</span>
                                <span className="text-[10px] text-gray-500">{versions.length} versions</span>
                            </div>

                            {versions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-[#252627]/30 rounded-xl border border-dashed border-white/5 mt-4">
                                    <History size={32} className="text-gray-600" />
                                    <p className="text-sm text-gray-500 px-6">No previous versions found. Save your first version above!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4 pb-10">
                                    {versions.map((v) => (
                                        <div
                                            key={v.id}
                                            className="group bg-[#252627] hover:bg-[#2F3031] border border-white/5 rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10"
                                        >
                                            {/* Visual Snapshot Card */}
                                            <div className="aspect-[1/1.414] bg-[#18191B] relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-700">
                                                {v.snapshot_path ? (
                                                    <img
                                                        src={`/storage/${v.snapshot_path}`}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                        alt={v.name}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-3 bg-[#18191B] border border-white/5 rounded-xl">
                                                        <History size={24} className="opacity-20 animate-pulse" />
                                                        <span className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30 text-center px-6">Preview Unavailable</span>
                                                    </div>
                                                )}

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-[#0E1318]/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col items-center justify-center gap-2 p-3">
                                                    <button
                                                        onClick={() => onRestoreVersion(v.id)}
                                                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-xl shadow-purple-900/40 transition-all active:scale-95"
                                                    >
                                                        <RotateCcw size={12} /> Restore
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteVersion(v.id)}
                                                        className="w-full py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-white/10 hover:border-red-500/30"
                                                    >
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Details Section */}
                                            <div className="p-3 bg-[#1C1C1E] border-t border-white/5 relative z-10">
                                                <h4 className="text-[11px] font-bold text-white truncate group-hover:text-purple-400 transition-colors mb-1">
                                                    {v.name || 'Untitled'}
                                                </h4>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[9px] font-bold text-gray-500 flex items-center gap-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-purple-500" />
                                                        {new Date(v.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </p>
                                                    <p className="text-[9px] font-medium text-gray-600">
                                                        {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'text' && (
                    <div className="grid gap-3">
                        <div
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'copy';
                                const data = { type: 'text', payload: { text: 'Add a heading', fontSize: 32, fontWeight: 'bold' } };
                                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                            }}
                            onClick={() => onAddElement('text', { text: 'Add a heading', fontSize: 32, fontWeight: 'bold' })}
                            className="w-full py-4 bg-[#252627] rounded-lg text-lg font-bold hover:ring-1 hover:ring-white/20 transition-all cursor-grab active:cursor-grabbing text-center"
                        >
                            Add a heading
                        </div>
                        <div
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'copy';
                                const data = { type: 'text', payload: { text: 'Add a subheading', fontSize: 24, fontWeight: 'medium' } };
                                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                            }}
                            onClick={() => onAddElement('text', { text: 'Add a subheading', fontSize: 24, fontWeight: 'medium' })}
                            className="w-full py-3 bg-[#252627] rounded-lg text-base font-medium hover:ring-1 hover:ring-white/20 transition-all cursor-grab active:cursor-grabbing text-center"
                        >
                            Add a subheading
                        </div>
                        <div
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'copy';
                                const data = { type: 'text', payload: { text: 'Add body text', fontSize: 16 } };
                                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                            }}
                            onClick={() => onAddElement('text', { text: 'Add body text', fontSize: 16 })}
                            className="w-full py-2 bg-[#252627] rounded-lg text-sm hover:ring-1 hover:ring-white/20 transition-all cursor-grab text-center text-gray-300"
                        >
                            Add body text
                        </div>
                    </div>
                )}

                {activeTab === 'elements' && (
                    <>
                    <div className="grid grid-cols-3 gap-2">
                        <div
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'copy';
                                const data = { type: 'rect', payload: { width: 100, height: 100, fill: '#6366f1' } };
                                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                            }}
                            onClick={() => onAddElement('rect', { width: 100, height: 100, fill: '#6366f1' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <Square size={24} className="text-indigo-400" />
                            <span className="text-[10px] text-gray-300">Square</span>
                        </div>
                        <div
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'copy';
                                const data = { type: 'circle', payload: { width: 100, height: 100, fill: '#ef4444' } };
                                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                            }}
                            onClick={() => onAddElement('circle', { width: 100, height: 100, fill: '#ef4444' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <Circle size={24} className="text-red-500" />
                            <span className="text-[10px] text-gray-300">Circle</span>
                        </div>
                        <div
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'copy';
                                const data = { type: 'triangle', payload: { width: 100, height: 100, fill: '#22c55e' } };
                                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                            }}
                            onClick={() => onAddElement('triangle', { width: 100, height: 100, fill: '#22c55e' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <Triangle size={24} className="text-green-500" />
                            <span className="text-[10px] text-gray-300">Triangle</span>
                        </div>
                        <div
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'copy';
                                const data = { type: 'star', payload: { width: 100, height: 100, fill: '#eab308' } };
                                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                            }}
                            onClick={() => onAddElement('star', { width: 100, height: 100, fill: '#eab308' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <Star size={24} className="text-yellow-500" />
                            <span className="text-[10px] text-gray-300">Star</span>
                        </div>
                        <div
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'copy';
                                const data = { type: 'polygon', payload: { width: 100, height: 100, fill: '#a855f7' } };
                                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                            }}
                            onClick={() => onAddElement('polygon', { width: 100, height: 100, fill: '#a855f7' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <Hexagon size={24} className="text-purple-500" />
                            <span className="text-[10px] text-gray-300">Shape</span>
                        </div>
                        <div
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'copy';
                                const data = { type: 'arrow', payload: { width: 100, height: 20, fill: '#3b82f6', stroke: '#3b82f6' } };
                                e.dataTransfer.setData('text/plain', JSON.stringify(data));
                            }}
                            onClick={() => onAddElement('arrow', { width: 100, height: 20, fill: '#3b82f6', stroke: '#3b82f6' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <ArrowRight size={24} className="text-blue-500" />
                            <span className="text-[10px] text-gray-300">Arrow</span>
                        </div>
                        <button
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('type', 'line');
                                e.dataTransfer.setData('payload', JSON.stringify({ width: 150, height: 5, stroke: '#ec4899' }));
                            }}
                            onClick={() => onAddElement('line', { width: 150, height: 5, stroke: '#ec4899' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <Minus size={24} className="text-pink-500" />
                            <span className="text-[10px] text-gray-300">Line</span>
                        </button>
                        <button
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('type', 'rect');
                                e.dataTransfer.setData('payload', JSON.stringify({ width: 100, height: 100, fill: '#8b5cf6', cornerRadius: 16 }));
                            }}
                            onClick={() => onAddElement('rect', { width: 100, height: 100, fill: '#8b5cf6', cornerRadius: 16 })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <div className="w-6 h-6 rounded-lg bg-violet-500" />
                            <span className="text-[10px] text-gray-300">Rounded</span>
                        </button>
                    </div>

                    <div className="mt-6">
                        <SectionHeader icon={Layout} title="Frames" />
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <button
                                draggable="true"
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('type', 'frame');
                                    e.dataTransfer.setData('payload', JSON.stringify({ width: 120, height: 120, fill: '#6366f1', frameShape: 'rect' }));
                                }}
                                onClick={() => onAddElement('frame', { width: 120, height: 120, fill: '#6366f1', frameShape: 'rect' })}
                                className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                            >
                                <Square size={24} className="text-indigo-400" />
                                <span className="text-[10px] text-gray-300">Rect</span>
                            </button>
                            <button
                                draggable="true"
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('type', 'frame');
                                    e.dataTransfer.setData('payload', JSON.stringify({ width: 120, height: 120, fill: '#ef4444', frameShape: 'circle' }));
                                }}
                                onClick={() => onAddElement('frame', { width: 120, height: 120, fill: '#ef4444', frameShape: 'circle' })}
                                className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                            >
                                <Circle size={24} className="text-red-500" />
                                <span className="text-[10px] text-gray-300">Circle</span>
                            </button>
                            <button
                                draggable="true"
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('type', 'frame');
                                    e.dataTransfer.setData('payload', JSON.stringify({ width: 120, height: 120, fill: '#22c55e', frameShape: 'triangle' }));
                                }}
                                onClick={() => onAddElement('frame', { width: 120, height: 120, fill: '#22c55e', frameShape: 'triangle' })}
                                className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                            >
                                <Triangle size={24} className="text-green-500" />
                                <span className="text-[10px] text-gray-300">Triangle</span>
                            </button>
                            <button
                                draggable="true"
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('type', 'frame');
                                    e.dataTransfer.setData('payload', JSON.stringify({ width: 120, height: 120, fill: '#eab308', frameShape: 'star' }));
                                }}
                                onClick={() => onAddElement('frame', { width: 120, height: 120, fill: '#eab308', frameShape: 'star' })}
                                className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                            >
                                <Star size={24} className="text-yellow-500" />
                                <span className="text-[10px] text-gray-300">Star</span>
                            </button>
                        </div>
                    </div>
                    </>
                )}

                {activeTab === 'photos' && (
                    <PhotosTabContent
                        searchQuery={photoSearchQuery}
                        onSearchChange={setPhotoSearchQuery}
                        onAddElement={onAddElement}
                    />
                )}

                {activeTab === 'design' && (
                    <DesignTabContent 
                        pages={pages} 
                        onUpdatePage={onUpdatePage} 
                        canvasWidth={canvasWidth}
                        canvasHeight={canvasHeight}
                        onCanvasResize={onCanvasResize}
                        userUploads={userUploads}
                        onUpload={onUpload}
                        isUploading={isUploading}
                    />
                )}

                {activeTab === 'uploads' && (
                    <div
                        className="grid gap-3 h-full"
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('bg-white/5');
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('bg-white/5');
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('bg-white/5');
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith('image/')) {
                                onUpload(file);
                            }
                        }}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) onUpload(file);
                            }}
                        />
                        <button
                            onClick={() => document.getElementById('file-upload').click()}
                            disabled={isUploading}
                            className={`w-full py-2 bg-purple-600 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-500 transition-colors ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            {isUploading ? 'Uploading...' : 'Upload file'}
                        </button>

                        <div className="grid grid-cols-2 gap-2 mt-4 overflow-y-auto pr-1 pb-10">
                            {isUploading && (
                                <div className="aspect-square bg-[#252627] rounded-md flex items-center justify-center relative overflow-hidden group border border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent animate-pulse" />
                                    <Loader2 size={24} className="text-purple-500 animate-spin relative z-10" />
                                </div>
                            )}
                            {userUploads.map((url, i) => (
                                <div key={i} className="relative group aspect-square">
                                    <div
                                        draggable="true"
                                        onDragStart={(e) => {
                                            e.dataTransfer.effectAllowed = 'copy';
                                            const data = { type: 'image', payload: { src: url, width: 200, height: 200 } };
                                            e.dataTransfer.setData('text/plain', JSON.stringify(data));
                                        }}
                                        onClick={() => onAddElement('image', { src: url, width: 200, height: 200 })}
                                        className="w-full h-full bg-[#252627] rounded-md overflow-hidden hover:ring-1 hover:ring-purple-500 transition-all cursor-grab active:cursor-grabbing border border-white/5"
                                    >
                                        <img src={url} className="w-full h-full object-cover pointer-events-none" alt="Upload" draggable="false" />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteUpload(url);
                                        }}
                                        className="absolute top-1 right-1 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg"
                                        title="Delete image"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'icons' && (
                    <div className="space-y-4 pb-20">
                        <SectionHeader icon={Smile} title="Icons" />
                        {[
                            { category: 'Social', icons: ['Mail', 'Phone', 'MapPin', 'Globe', 'Linkedin', 'Github', 'Twitter', 'Facebook', 'Instagram', 'Youtube', 'Slack', 'Twitch'] },
                            { category: 'User', icons: ['User', 'Users', 'UserPlus', 'UserCheck', 'Star', 'Heart', 'ThumbsUp', 'Award', 'Medal', 'Crown'] },
                            { category: 'Brands', icons: ['Google', 'Facebook', 'Youtube', 'Apple', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Tesla', 'Airbnb', 'Spotify'] },
                            { category: 'Technology', icons: ['React', 'Javascript', 'Typescript', 'Python', 'Php', 'Node', 'Docker', 'Aws', 'Git', 'Postgresql', 'Mysql'] },
                            { category: 'Arrows & Nav', icons: ['ChevronUp', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Move', 'ExternalLink'] },
                            { category: 'Business', icons: ['CreditCard', 'Banknote', 'PieChart', 'BarChart', 'TrendingUp', 'TrendingDown', 'DollarSign', 'EuroSign', 'ShoppingCart', 'ShoppingBag'] },
                            { category: 'Systems', icons: ['Settings', 'Bell', 'Briefcase', 'Code', 'Terminal', 'Database', 'Server', 'Cloud', 'Wifi', 'Cpu', 'Monitor', 'Smartphone'] },
                            { category: 'Education', icons: ['GraduationCap', 'BookOpen', 'Book', 'Library', 'PenTool', 'Edit', 'FileText', 'Clipboard', 'CheckCircle', 'Calendar'] },
                            { category: 'Food & Travel', icons: ['Coffee', 'Pizza', 'Utensils', 'Plane', 'Car'] },
                            { category: 'Media', icons: ['Camera', 'Music', 'Video', 'Tv', 'Gamepad'] },
                            { category: 'General', icons: ['Send', 'Share', 'Download', 'File', 'Folder', 'Check', 'HelpCircle', 'Info', 'X'] },
                        ].map(group => {
                            const filteredIcons = group.icons.filter(icon => 
                                icon.toLowerCase().includes(iconSearchQuery.toLowerCase())
                            );
                            if (filteredIcons.length === 0) return null;
                            return (
                                <div key={group.category}>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{group.category}</h4>
                                    <div className="grid grid-cols-5 gap-2">
                                        {filteredIcons.map(iconName => (
                                            <button
                                                key={iconName}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('type', 'icon');
                                                    e.dataTransfer.setData('payload', JSON.stringify({ iconName, width: 40, height: 40, fill: '#000000' }));
                                                }}
                                                onClick={() => onAddElement('icon', { iconName, width: 40, height: 40, fill: '#000000' })}
                                                className="aspect-square bg-[#252627] rounded-lg flex items-center justify-center hover:bg-[#2F3031] transition-colors border border-transparent hover:border-white/10 cursor-grab active:cursor-grabbing"
                                                title={iconName}
                                            >
                                                {iconComponents[iconName] ? React.createElement(iconComponents[iconName], { size: 20, className: 'text-gray-400' }) : <span className="text-[10px] text-gray-400">{iconName}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'profile' && profile && (
                    <div className="space-y-6 pb-20">
                        {/* Personal Information */}
                        <div className="space-y-3">
                            <SectionHeader icon={User} title="Personal Info" />
                            <div className="grid gap-2">
                                <ProfileItem
                                    label="Full Name"
                                    value={profile.userDetail?.full_name}
                                    semantic="full_name"
                                    onAdd={onAddElement}
                                />
                                <ProfileItem
                                    label="Job Title"
                                    value={profile.userDetail?.job_title}
                                    semantic="position"
                                    onAdd={onAddElement}
                                />
                                <ProfileItem
                                    label="Email"
                                    value={profile.userDetail?.email}
                                    semantic="email"
                                    onAdd={onAddElement}
                                />
                                <ProfileItem
                                    label="Phone"
                                    value={profile.userDetail?.phone}
                                    semantic="phone"
                                    onAdd={onAddElement}
                                />
                                <ProfileItem
                                    label="Location"
                                    value={profile.userDetail?.address}
                                    semantic="location"
                                    onAdd={onAddElement}
                                />
                                <ProfileItem
                                    label="Summary"
                                    value={profile.userDetail?.professional_summary}
                                    semantic="summary"
                                    isLongText
                                    onAdd={onAddElement}
                                />
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="space-y-3">
                            <SectionHeader icon={Briefcase} title="Experience" />
                            <div className="space-y-3">
                                {profile.experiences?.map((exp, idx) => (
                                    <div key={exp.id} className="p-3 bg-[#252627] rounded-xl border border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Role {idx + 1}</span>
                                        </div>
                                        <div className="grid gap-2">
                                            <ProfileItem label="Position" value={exp.position} semantic="exp_position" onAdd={onAddElement} />
                                            <ProfileItem label="Company" value={exp.company} semantic="exp_company" onAdd={onAddElement} />
                                            <ProfileItem label="Location" value={exp.location} semantic="exp_location" onAdd={onAddElement} />
                                            <ProfileItem label="Period" value={`${exp.start_date} - ${exp.end_date || 'Present'}`} onAdd={onAddElement} />
                                        </div>
                                    </div>
                                ))}
                                {(!profile.experiences || profile.experiences.length === 0) && (
                                    <p className="text-[10px] text-gray-500 italic px-1">No experience entries found.</p>
                                )}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="space-y-3">
                            <SectionHeader icon={GraduationCap} title="Education" />
                            <div className="space-y-3">
                                {profile.educations?.map((edu, idx) => (
                                    <div key={edu.id} className="p-3 bg-[#252627] rounded-xl border border-white/5 space-y-2">
                                         <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Entry {idx + 1}</span>
                                        </div>
                                        <div className="grid gap-2">
                                            <ProfileItem label="Degree" value={edu.degree} semantic="edu_degree" onAdd={onAddElement} />
                                            <ProfileItem label="School" value={edu.school} semantic="edu_school" onAdd={onAddElement} />
                                            <ProfileItem label="Period" value={`${edu.start_date} - ${edu.end_date || 'Present'}`} onAdd={onAddElement} />
                                        </div>
                                    </div>
                                ))}
                                {(!profile.educations || profile.educations.length === 0) && (
                                    <p className="text-[10px] text-gray-500 italic px-1">No education entries found.</p>
                                )}
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-3">
                            <SectionHeader icon={Award} title="Skills" />
                            <div className="flex flex-wrap gap-2">
                                {profile.skills?.map((skill) => (
                                    <button
                                        key={skill.id}
                                        onClick={() => onAddElement('text', { text: skill.name, fontSize: 14, semantic: 'skill_name' })}
                                        className="px-3 py-1.5 bg-[#252627] hover:bg-[#2F3031] border border-white/5 rounded-lg text-xs text-white transition-all"
                                    >
                                        {skill.name}
                                    </button>
                                ))}
                                {(!profile.skills || profile.skills.length === 0) && (
                                    <p className="text-[10px] text-gray-500 italic px-1">No skills found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && !profile && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <User size={48} className="text-gray-700" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-white">Profile Data Unavailable</p>
                            <p className="text-[11px] text-gray-500 px-10 leading-relaxed">Please complete your profile in the User Details section to use it here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DesignTabContent({ pages, onUpdatePage, canvasWidth, canvasHeight, onCanvasResize, userUploads = [], onUpload, isUploading }) {
    const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id);
    const page = pages.find(p => p.id === selectedPageId) || pages[0];
    const bgType = page?.backgroundGradient ? 'gradient' : (page?.backgroundImage !== null && page?.backgroundImage !== undefined) ? 'image' : 'solid';
    const fileInputRef = useRef();

    const handleColorChange = (color) => {
        onUpdatePage(page.id, { backgroundColor: color, backgroundGradient: null, backgroundImage: null });
    };

    const handleGradientChange = (gradient) => {
        onUpdatePage(page.id, { backgroundGradient: gradient, backgroundColor: null, backgroundImage: null });
    };

    const handleImageChange = (url) => {
        // Use a default nice abstract background if turning on image for the first time with no url
        const finalUrl = url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809';
        onUpdatePage(page.id, { backgroundImage: finalUrl, backgroundColor: null, backgroundGradient: null });
    };

    const handleBackgroundUpload = async (e) => {
        const file = e.target.files[0];
        if (file && onUpload) {
            const url = await onUpload(file, false);
            if (url) handleImageChange(url);
        }
    };

    if (!page) return null;

    return (
        <div className="space-y-6 pb-20 mt-4">
            {/* Page Setup Section */}
            <div className="bg-[#252627] p-4 rounded-xl border border-white/5 space-y-4">
                <SectionHeader icon={Monitor} title="Page Setup" />
                
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Width</label>
                        <input 
                            type="number" 
                            value={canvasWidth}
                            onChange={(e) => onCanvasResize(parseInt(e.target.value) || 0, canvasHeight)}
                            className="w-full bg-[#18191B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Height</label>
                        <input 
                            type="number" 
                            value={canvasHeight}
                            onChange={(e) => onCanvasResize(canvasWidth, parseInt(e.target.value) || 0)}
                            className="w-full bg-[#18191B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase px-1 block">Presets</label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { name: 'A4', w: 595, h: 842 },
                            { name: 'Letter', w: 612, h: 792 },
                            { name: 'Legal', w: 612, h: 1008 },
                            { name: 'Square', w: 1000, h: 1000 },
                        ].map(preset => (
                            <button
                                key={preset.name}
                                onClick={() => onCanvasResize(preset.w, preset.h)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${canvasWidth === preset.w && canvasHeight === preset.h ? 'bg-purple-600 text-white' : 'bg-[#18191B] text-gray-400 hover:text-white border border-white/5'}`}
                            >
                                {preset.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-px bg-white/5 my-2" />

            <div>
                <SectionHeader icon={Layers} title="Select Page" />
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {pages.map((p, idx) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPageId(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedPageId === p.id ? 'bg-purple-600 text-white' : 'bg-[#252627] text-gray-300 hover:bg-[#2F3031]'}`}
                        >
                            Page {idx + 1}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <SectionHeader icon={Palette} title="Background Type" />
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => handleColorChange(page?.backgroundColor || '#ffffff')}
                        className={`py-2 rounded-lg text-xs font-medium transition-colors ${bgType === 'solid' ? 'bg-purple-600 text-white' : 'bg-[#252627] text-gray-300 hover:bg-[#2F3031]'}`}
                    >
                        Solid
                    </button>
                    <button
                        onClick={() => handleGradientChange(page?.backgroundGradient || { startColor: '#7c3aed', endColor: '#db2777', angle: 135 })}
                        className={`py-2 rounded-lg text-xs font-medium transition-colors ${bgType === 'gradient' ? 'bg-purple-600 text-white' : 'bg-[#252627] text-gray-300 hover:bg-[#2F3031]'}`}
                    >
                        Gradient
                    </button>
                    <button
                        onClick={() => handleImageChange(page?.backgroundImage || '')}
                        className={`py-2 rounded-lg text-xs font-medium transition-colors ${bgType === 'image' ? 'bg-purple-600 text-white' : 'bg-[#252627] text-gray-300 hover:bg-[#2F3031]'}`}
                    >
                        Image
                    </button>
                </div>
            </div>

            {bgType === 'solid' && (
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Color</label>
                    <input
                        type="color"
                        value={page?.backgroundColor || '#ffffff'}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
                    />
                </div>
            )}

            {bgType === 'gradient' && (
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Start Color</label>
                        <input
                            type="color"
                            value={page?.backgroundGradient?.startColor || '#7c3aed'}
                            onChange={(e) => handleGradientChange({ ...(page?.backgroundGradient || {}), startColor: e.target.value })}
                            className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">End Color</label>
                        <input
                            type="color"
                            value={page?.backgroundGradient?.endColor || '#db2777'}
                            onChange={(e) => handleGradientChange({ ...(page?.backgroundGradient || {}), endColor: e.target.value })}
                            className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Angle</label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={page?.backgroundGradient?.angle || 135}
                            onChange={(e) => handleGradientChange({ ...(page?.backgroundGradient || {}), angle: parseInt(e.target.value) })}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-xs text-gray-400 mt-1 block">{page?.backgroundGradient?.angle || 135}°</span>
                    </div>
                </div>
            )}

            {bgType === 'image' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Background Image</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-32 bg-[#18191B] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer group"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleBackgroundUpload} 
                                className="hidden" 
                                accept="image/*"
                            />
                            {isUploading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                        <Plus size={20} className="text-gray-400 group-hover:text-purple-400" />
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-500 group-hover:text-gray-300">Upload new image</span>
                                </>
                            )}
                        </div>
                    </div>

                    {userUploads.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Select from Uploads</label>
                            <div className="grid grid-cols-3 gap-2">
                                {userUploads.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleImageChange(url)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${page?.backgroundImage === url ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-transparent hover:border-white/20'}`}
                                    >
                                        <img src={url} className="w-full h-full object-cover" alt="Upload" />
                                        {page?.backgroundImage === url && (
                                            <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                                                <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Image URL</label>
                        <input
                            type="text"
                            value={page?.backgroundImage || ''}
                            onChange={(e) => handleImageChange(e.target.value)}
                            placeholder="Paste image URL..."
                            className="w-full bg-[#252627] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function PhotosTabContent({ searchQuery, onSearchChange, onAddElement }) {
    const PEXELS_API_KEY = 'mPnzGvFd3z3qTEsUK2d3MFXGrbeqIGsJwdCP50o8RJ9ZRazZ5P0BbOmS';
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPhotos = async () => {
            setLoading(true);
            try {
                const url = searchQuery 
                    ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=40` 
                    : `https://api.pexels.com/v1/curated?per_page=40`;
                
                const response = await axios.get(url, {
                    headers: { Authorization: PEXELS_API_KEY }
                });
                
                setPhotos(response.data.photos.map(p => ({
                    id: p.id,
                    url: p.src.large,
                    thumb: p.src.medium,
                    title: p.alt || 'Stock photo'
                })));
            } catch (err) {
                console.error('Pexels API Error:', err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchPhotos, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <div className="flex flex-col h-full">
            <div className="px-0 mb-4 mt-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={`Search stock photos...`}
                        className="w-full bg-[#252627] border-none rounded-md py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-purple-500 text-white"
                    />
                </div>
            </div>

            <div className="flex-1 space-y-4 pb-10 overflow-y-auto custom-scrollbar pr-1">
                {loading && photos.length === 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-square bg-[#252627] animate-pulse rounded-md" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {photos.map((photo) => (
                            <div key={photo.id} className="relative group aspect-square">
                                <div
                                    draggable="true"
                                    onDragStart={(e) => {
                                        e.dataTransfer.effectAllowed = 'copy';
                                        const data = { type: 'image', payload: { src: photo.url, width: 200, height: 200 } };
                                        e.dataTransfer.setData('text/plain', JSON.stringify(data));
                                    }}
                                    onClick={() => onAddElement('image', { src: photo.url, width: 200, height: 200 })}
                                    className="w-full h-full bg-[#252627] rounded-md overflow-hidden hover:ring-1 hover:ring-purple-500 transition-all cursor-grab active:cursor-grabbing border border-white/5"
                                >
                                    <img 
                                        src={photo.thumb} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none" 
                                        alt={photo.title}
                                        title={photo.title}
                                        draggable="false"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pointer-events-none">
                                    <span className="text-[10px] text-white font-medium truncate">{photo.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {!loading && photos.length === 0 && (
                    <div className="py-20 text-center space-y-3">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600">
                            <Plus size={24} className="rotate-45" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-400">No photos found</p>
                            <p className="text-[11px] text-gray-600 px-10">Try searching for something else like "office", "nature", or "business".</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SectionHeader({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-2 px-1 mb-2">
            <Icon size={14} className="text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</span>
        </div>
    );
}

function ProfileItem({ label, value, semantic, onAdd, isLongText = false }) {
    if (!value) return null;

    const truncatedValue = value.length > 40 ? value.substring(0, 37) + '...' : value;

    const handleAdd = () => {
        onAdd('text', {
            text: value,
            fontSize: isLongText ? 12 : 16,
            semantic: semantic,
            width: isLongText ? 300 : 200,
            textAlign: 'left'
        });
    };

    return (
        <button
            draggable="true"
            onDragStart={(e) => {
                e.dataTransfer.setData('type', 'text');
                e.dataTransfer.setData('payload', JSON.stringify({
                    text: value,
                    fontSize: isLongText ? 12 : 16,
                    semantic: semantic,
                    width: isLongText ? 300 : 200
                }));
            }}
            onClick={handleAdd}
            className="w-full p-2.5 bg-[#252627]/50 hover:bg-[#2F3031] border border-white/5 rounded-lg flex flex-col items-start gap-0.5 transition-all text-left group"
        >
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter group-hover:text-purple-400 transition-colors">{label}</span>
            <span className="text-xs text-white font-medium line-clamp-1">{truncatedValue}</span>
        </button>
    );
}
