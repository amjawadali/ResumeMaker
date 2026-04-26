import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Search, SlidersHorizontal, Sparkles, TrendingUp, Clock, Star, LayoutGrid, ChevronLeft, ChevronRight, X, Briefcase, Palette, FileText } from 'lucide-react';
import TemplateCard from '@/Components/Marketplace/TemplateCard';
import { motion, AnimatePresence } from 'framer-motion';

// Simple native debounce implementation to avoid lodash dependency
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export default function Index({ auth, templates, categories, profile, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'All');
    const [sortBy, setSortBy] = useState(filters.sort || 'popular');
    const [isMagicFillActive, setIsMagicFillActive] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [experienceLevel, setExperienceLevel] = useState(filters.experience || 'All');
    const [templateStyle, setTemplateStyle] = useState(filters.style || 'All');
    const [pageCount, setPageCount] = useState(filters.pages || 'All');

    const performSearch = useCallback(
        debounce((params) => {
            router.get(route('templates.index'), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        performSearch({ search: query, category: selectedCategory, sort: sortBy });
    };

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        performSearch({ search: searchQuery, category: cat, sort: sortBy });
    };

    const handleSortChange = (sort) => {
        setSortBy(sort);
        performSearch({ search: searchQuery, category: selectedCategory, sort: sort, experience: experienceLevel, style: templateStyle, pages: pageCount });
    };

    const handleExperienceChange = (level) => {
        setExperienceLevel(level);
        performSearch({ search: searchQuery, category: selectedCategory, sort: sortBy, experience: level, style: templateStyle, pages: pageCount });
    };

    const handleStyleChange = (style) => {
        setTemplateStyle(style);
        performSearch({ search: searchQuery, category: selectedCategory, sort: sortBy, experience: experienceLevel, style: style, pages: pageCount });
    };

    const handlePageCountChange = (count) => {
        setPageCount(count);
        performSearch({ search: searchQuery, category: selectedCategory, sort: sortBy, experience: experienceLevel, style: templateStyle, pages: count });
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setExperienceLevel('All');
        setTemplateStyle('All');
        setPageCount('All');
        performSearch({ search: '', category: 'All', sort: sortBy, experience: 'All', style: 'All', pages: 'All' });
    };

    const activeFilterCount = [
        selectedCategory !== 'All',
        experienceLevel !== 'All',
        templateStyle !== 'All',
        pageCount !== 'All'
    ].filter(Boolean).length;

    const templateList = templates.data || [];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Community Marketplace" />

            <div className="min-h-screen bg-[#0E1318] text-white py-12 px-6 lg:px-12">
                <div className="max-w-[1400px] mx-auto space-y-12">

                    {/* Marketplace Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full w-fit">
                                <Sparkles size={14} className="text-purple-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Community Marketplace</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                                Discover World-Class <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">
                                    Resume Designs.
                                </span>
                            </h1>
                            <p className="text-slate-400 text-lg max-w-xl font-medium">
                                Level up your professional look with templates designed by the community.
                                <span className="text-white ml-2">Browse, fork, and customize in seconds.</span>
                            </p>
                        </div>

                        {/* Magic Fill Toggle - Desktop */}
                        <div className="hidden lg:flex items-center gap-4 bg-slate-800/40 p-4 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-white flex items-center gap-2">
                                    <Sparkles size={16} className="text-amber-400" />
                                    Magic Fill Previews
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Show templates with your data</p>
                            </div>
                            <button
                                onClick={() => setIsMagicFillActive(!isMagicFillActive)}
                                className={`w-14 h-8 rounded-full transition-all duration-300 relative p-1 ${isMagicFillActive ? 'bg-[#7D2AE8]' : 'bg-slate-700'}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${isMagicFillActive ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-col lg:flex-row items-center gap-4 pt-8 border-t border-white/5">
                        <div className="relative flex-1 w-full lg:w-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search by design name, style, or industry..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-12 pr-4 py-4 bg-slate-800/20 border-white/10 rounded-2xl focus:ring-purple-500 focus:border-purple-500 text-sm font-medium transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
                            {['All', ...(categories || [])].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                        selectedCategory === cat
                                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                                        : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="h-8 w-px bg-white/5 hidden lg:block mx-2"></div>

                        <div className="flex items-center gap-3 bg-slate-800/20 p-1.5 rounded-2xl border border-white/10 w-full lg:w-auto">
                            <SortButton active={sortBy === 'trending'} onClick={() => handleSortChange('trending')} icon={TrendingUp} label="Hot" />
                            <SortButton active={sortBy === 'newest'} onClick={() => handleSortChange('newest')} icon={Clock} label="New" />
                            <SortButton active={sortBy === 'popular'} onClick={() => handleSortChange('popular')} icon={Star} label="Top" />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                                showFilters || activeFilterCount > 0
                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                                    : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                            }`}
                        >
                            <SlidersHorizontal size={14} />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{activeFilterCount}</span>
                            )}
                        </button>
                    </div>

                    {/* Expanded Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 pt-4 border-t border-white/5">
                                    {/* Experience Level */}
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={14} className="text-slate-400 shrink-0" />
                                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                            {['All', 'Entry', 'Mid', 'Senior', 'Executive'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => handleExperienceChange(level)}
                                                    className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                                                        experienceLevel === level
                                                            ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                                                            : 'bg-slate-800/20 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Template Style */}
                                    <div className="flex items-center gap-2">
                                        <Palette size={14} className="text-slate-400 shrink-0" />
                                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                            {['All', 'Modern', 'Classic', 'Creative', 'Minimal'].map((style) => (
                                                <button
                                                    key={style}
                                                    onClick={() => handleStyleChange(style)}
                                                    className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                                                        templateStyle === style
                                                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                                            : 'bg-slate-800/20 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                                                    }`}
                                                >
                                                    {style}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Page Count */}
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-slate-400 shrink-0" />
                                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                            {['All', '1-Page', '2-Page', 'Multi'].map((count) => (
                                                <button
                                                    key={count}
                                                    onClick={() => handlePageCountChange(count)}
                                                    className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                                                        pageCount === count
                                                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                                                            : 'bg-slate-800/20 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                                                    }`}
                                                >
                                                    {count}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Active Filter Badges */}
                    {activeFilterCount > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {selectedCategory !== 'All' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[11px] text-purple-300">
                                    {selectedCategory}
                                    <button onClick={() => handleCategoryChange('All')} className="hover:text-white"><X size={12} /></button>
                                </span>
                            )}
                            {experienceLevel !== 'All' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-[11px] text-teal-300">
                                    {experienceLevel} Level
                                    <button onClick={() => handleExperienceChange('All')} className="hover:text-white"><X size={12} /></button>
                                </span>
                            )}
                            {templateStyle !== 'All' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300">
                                    {templateStyle}
                                    <button onClick={() => handleStyleChange('All')} className="hover:text-white"><X size={12} /></button>
                                </span>
                            )}
                            {pageCount !== 'All' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] text-blue-300">
                                    {pageCount}
                                    <button onClick={() => handlePageCountChange('All')} className="hover:text-white"><X size={12} /></button>
                                </span>
                            )}
                            <button onClick={clearAllFilters} className="text-[10px] text-slate-500 hover:text-white underline underline-offset-2 ml-2">
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Template Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
                        <AnimatePresence>
                            {templateList.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    profile={profile}
                                    isMagicFillActive={isMagicFillActive}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {templates.links && templates.links.length > 3 && (
                        <div className="flex items-center justify-center gap-2 py-8">
                            {templates.links.map((link, i) => {
                                if (link.label.includes('Previous')) {
                                    return (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            className={`p-3 rounded-xl border border-white/5 transition-all ${link.url ? 'hover:bg-slate-800 text-white' : 'text-slate-600 opacity-50'}`}
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                    );
                                }
                                if (link.label.includes('Next')) {
                                    return (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            className={`p-3 rounded-xl border border-white/5 transition-all ${link.url ? 'hover:bg-slate-800 text-white' : 'text-slate-600 opacity-50'}`}
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    );
                                }
                                return (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border ${
                                            link.active
                                            ? 'bg-purple-600 border-purple-500 text-white'
                                            : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {templateList.length === 0 && (
                        <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-6 bg-slate-800/40 rounded-[3rem] border border-white/5 mb-4">
                                <Search size={48} className="text-slate-600" />
                            </div>
                            <h3 className="text-2xl font-black text-white">No templates found</h3>
                            <p className="text-slate-500 max-w-sm font-medium">Try adjusting your search filters to find what you're looking for.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); performSearch({ search: '', category: 'All', sort: sortBy }); }}
                                className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm mt-4 transition-transform active:scale-95"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function SortButton({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-white'
            }`}
        >
            <Icon size={14} />
            <span>{label}</span>
        </button>
    );
}
