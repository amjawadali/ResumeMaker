import React, { useState } from 'react';
import { X, Search, Image as ImageIcon, Type, Square, Upload } from 'lucide-react';

export default function EditorResourcesDrawer({ activeTab, onAddElement, userUploads = [] }) {
    if (!activeTab) return null;

    return (
        <div className="w-full h-full bg-[#18191B] border-r border-white/5 flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-4 flex items-center justify-between">
                <h2 className="font-bold text-white capitalize">{activeTab}</h2>
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

            <div className="flex-1 overflow-y-auto p-4 pt-0 custom-scrollbar">
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
                            className="aspect-square bg-[#252627] rounded-md flex flex-col items-center justify-center gap-1 hover:bg-[#2F3031] transition-colors cursor-grab active:cursor-grabbing"
                        >
                            <Square size={20} />
                            <span className="text-[10px]">Square</span>
                        </button>
                    </div>
                )}

                {activeTab === 'uploads' && (
                    <div className="grid gap-3">
                        <button className="w-full py-2 bg-purple-600 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-500 transition-colors">
                            <Upload size={16} /> Upload file
                        </button>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {userUploads.map((url, i) => (
                                <button
                                    key={i}
                                    draggable="true"
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('type', 'image');
                                        e.dataTransfer.setData('payload', JSON.stringify({ src: url, width: 200, height: 200 }));
                                    }}
                                    onClick={() => onAddElement('image', { src: url, width: 200, height: 200 })}
                                    className="aspect-square bg-[#252627] rounded-md overflow-hidden hover:ring-1 hover:ring-purple-500 transition-all cursor-grab active:cursor-grabbing"
                                >
                                    <img src={url} className="w-full h-full object-cover pointer-events-none" alt="Upload" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
