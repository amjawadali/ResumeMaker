import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Image as ImageIcon, Type, Square, Upload, Loader2, Trash2, Circle, Triangle, Star, ArrowRight, Minus, Hexagon, History, RotateCcw, Plus, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Languages } from 'lucide-react';

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
    profile = null
}) {
    if (!activeTab) return null;

    const [newVersionName, setNewVersionName] = useState('');
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

    return (
        <div ref={drawerRef} className={`fixed top-[64px] left-[72px] bottom-4 ${activeTab === 'history' ? 'w-[600px]' : 'w-80'} bg-[#18191B] border border-white/10 rounded-xl shadow-2xl flex flex-col z-[30] overflow-hidden transition-all duration-300 animate-in slide-in-from-left`}>
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <h2 className="font-bold text-white capitalize">{activeTab === 'history' ? 'Version History' : activeTab}</h2>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                </button>
            </div>

            {activeTab !== 'history' && (
                <div className="px-4 mb-4 mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            className="w-full bg-[#252627] border-none rounded-md py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-purple-500 text-white"
                        />
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pt-0 custom-scrollbar">
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
                        <button
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('type', 'text');
                                e.dataTransfer.setData('payload', JSON.stringify({ text: 'Add a heading', fontSize: 32, fontWeight: 'bold' }));
                            }}
                            onClick={() => onAddElement('text', { text: 'Add a heading', fontSize: 32, fontWeight: 'bold' })}
                            className="w-full py-4 bg-[#252627] rounded-lg text-lg font-bold hover:ring-1 hover:ring-white/20 transition-all cursor-grab active:cursor-grabbing"
                        >
                            Add a heading
                        </button>
                        <button
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('type', 'text');
                                e.dataTransfer.setData('payload', JSON.stringify({ text: 'Add a subheading', fontSize: 24, fontWeight: 'medium' }));
                            }}
                            onClick={() => onAddElement('text', { text: 'Add a subheading', fontSize: 24, fontWeight: 'medium' })}
                            className="w-full py-3 bg-[#252627] rounded-lg text-base font-medium hover:ring-1 hover:ring-white/20 transition-all cursor-grab active:cursor-grabbing"
                        >
                            Add a subheading
                        </button>
                        <button
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('type', 'text');
                                e.dataTransfer.setData('payload', JSON.stringify({ text: 'Add body text', fontSize: 16 }));
                            }}
                            onClick={() => onAddElement('text', { text: 'Add body text', fontSize: 16 })}
                            className="w-full py-2 bg-[#252627] rounded-lg text-sm hover:ring-1 hover:ring-white/20 transition-all cursor-grab"
                        >
                            Add body text
                        </button>
                    </div>
                )}

                {activeTab === 'elements' && (
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('type', 'rect');
                                e.dataTransfer.setData('payload', JSON.stringify({ width: 100, height: 100, fill: '#6366f1' }));
                            }}
                            onClick={() => onAddElement('rect', { width: 100, height: 100, fill: '#6366f1' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <Square size={24} className="text-indigo-400" />
                            <span className="text-[10px] text-gray-300">Square</span>
                        </button>
                        <button
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('type', 'circle');
                                e.dataTransfer.setData('payload', JSON.stringify({ width: 100, height: 100, fill: '#ef4444' }));
                            }}
                            onClick={() => onAddElement('circle', { width: 100, height: 100, fill: '#ef4444' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <Circle size={24} className="text-red-500" />
                            <span className="text-[10px] text-gray-300">Circle</span>
                        </button>
                        <button
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('type', 'triangle');
                                e.dataTransfer.setData('payload', JSON.stringify({ width: 100, height: 100, fill: '#22c55e' }));
                            }}
                            onClick={() => onAddElement('triangle', { width: 100, height: 100, fill: '#22c55e' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <Triangle size={24} className="text-green-500" />
                            <span className="text-[10px] text-gray-300">Triangle</span>
                        </button>
                        <button
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('type', 'star');
                                e.dataTransfer.setData('payload', JSON.stringify({ width: 100, height: 100, fill: '#eab308' }));
                            }}
                            onClick={() => onAddElement('star', { width: 100, height: 100, fill: '#eab308' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <Star size={24} className="text-yellow-500" />
                            <span className="text-[10px] text-gray-300">Star</span>
                        </button>
                        <button
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('type', 'polygon');
                                e.dataTransfer.setData('payload', JSON.stringify({ width: 100, height: 100, fill: '#a855f7' }));
                            }}
                            onClick={() => onAddElement('polygon', { width: 100, height: 100, fill: '#a855f7' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <Hexagon size={24} className="text-purple-500" />
                            <span className="text-[10px] text-gray-300">Shape</span>
                        </button>
                        <button
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('type', 'arrow');
                                e.dataTransfer.setData('payload', JSON.stringify({ width: 100, height: 20, fill: '#3b82f6', stroke: '#3b82f6' }));
                            }}
                            onClick={() => onAddElement('arrow', { width: 100, height: 20, fill: '#3b82f6', stroke: '#3b82f6' })}
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10"
                        >
                            <ArrowRight size={24} className="text-blue-500" />
                            <span className="text-[10px] text-gray-300">Arrow</span>
                        </button>
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
                    </div>
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
                                    <button
                                        draggable="true"
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('type', 'image');
                                            e.dataTransfer.setData('payload', JSON.stringify({ src: url, width: 200, height: 200 }));
                                        }}
                                        onClick={() => onAddElement('image', { src: url, width: 200, height: 200 })}
                                        className="w-full h-full bg-[#252627] rounded-md overflow-hidden hover:ring-1 hover:ring-purple-500 transition-all cursor-grab active:cursor-grabbing border border-white/5"
                                    >
                                        <img src={url} className="w-full h-full object-cover pointer-events-none" alt="Upload" />
                                    </button>
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
