import React, { useState } from 'react';
import { X, Search, Image as ImageIcon, Type, Square, Upload, Loader2, Trash2, Circle, Triangle, Star, ArrowRight, Minus, Hexagon } from 'lucide-react';

export default function EditorResourcesDrawer({ activeTab, onAddElement, onUpload, onDeleteUpload, isUploading, userUploads = [], onClose }) {
    if (!activeTab) return null;

    return (
        <div className="fixed top-[64px] left-[72px] bottom-4 w-80 bg-[#18191B] border border-white/10 rounded-xl shadow-2xl flex flex-col z-[30] overflow-hidden animate-in slide-in-from-left duration-200">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <h2 className="font-bold text-white capitalize">{activeTab}</h2>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} className="text-slate-400" />
                </button>
            </div>

            <div className="px-4 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        className="w-full bg-[#252627] border-none rounded-md py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-purple-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pt-0 custom-scrollbar">
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
            </div>
        </div>
    );
}
