import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle, Info, Tag, Layout, Layers } from 'lucide-react';

const REQUIRED_SEMANTIC_TAGS = [
    'full_name', 'email', 'phone', 'profile_photo'
];

const RECOMMENDED_SECTIONS = [
    { key: 'experience', tags: ['experience_repeater', 'experience_company', 'experience_title', 'experience_date'] },
    { key: 'education', tags: ['education_repeater', 'education_school', 'education_degree', 'education_date'] },
    { key: 'skills', tags: ['skill_name'] },
    { key: 'summary', tags: ['summary', 'position'] },
];

export default function TemplateValidationSidebar({ pages }) {
    const analysis = useMemo(() => {
        if (!pages || pages.length === 0) return null;

        const warnings = [];
        const infos = [];
        const presentTags = new Set();
        const textElements = [];
        let hasRepeater = false;

        pages.forEach(page => {
            const collect = (elements) => {
                elements.forEach(el => {
                    if (el.semantic) {
                        presentTags.add(el.semantic);
                    }
                    if (el.type === 'text') {
                        textElements.push(el);
                    }
                    if (el.semantic && el.semantic.endsWith('_repeater')) {
                        hasRepeater = true;
                    }
                    if (el.elements) collect(el.elements);
                });
            };
            collect(page.elements || []);
        });

        // Check required tags
        const missingRequired = REQUIRED_SEMANTIC_TAGS.filter(tag => !presentTags.has(tag));
        if (missingRequired.length > 0) {
            warnings.push({
                type: 'missing_required',
                message: `Missing required tags: ${missingRequired.join(', ')}`,
                detail: 'These tags ensure the resume can be auto-filled from user profiles.'
            });
        }

        // Check for at least one repeater
        if (!hasRepeater) {
            warnings.push({
                type: 'no_repeater',
                message: 'No experience or education repeater blocks found',
                detail: 'Templates with repeater blocks can auto-populate lists from profile data.'
            });
        }

        // Check recommended sections
        RECOMMENDED_SECTIONS.forEach(section => {
            const hasAny = section.tags.some(tag => presentTags.has(tag));
            if (!hasAny) {
                infos.push({
                    type: 'missing_section',
                    message: `No ${section.key} section detected`,
                    detail: `Consider adding ${section.key} semantic tags for better profile matching.`
                });
            }
        });

        // Check for placeholder text that hasn't been semantic-tagged
        const untaggedPlaceholders = textElements.filter(el => {
            const text = (el.text || '').toLowerCase();
            return !el.semantic && (
                text.includes('lorem ipsum') ||
                text.includes('placeholder') ||
                text.includes('your name') ||
                text.includes('sample text')
            );
        });

        if (untaggedPlaceholders.length > 0) {
            warnings.push({
                type: 'placeholders',
                message: `${untaggedPlaceholders.length} placeholder text element(s) found`,
                detail: 'Consider replacing placeholder text with semantic tags so the template auto-fills user data.'
            });
        }

        // Check page count
        if (pages.length > 2) {
            infos.push({
                type: 'page_count',
                message: `Template has ${pages.length} pages`,
                detail: 'Multi-page templates are supported but most resumes fit on 1-2 pages.'
            });
        }

        return { warnings, infos, presentTags: presentTags.size, totalTags: presentTags.size + missingRequired.length };
    }, [pages]);

    if (!analysis) return null;

    const { warnings, infos, presentTags, totalTags } = analysis;
    const hasIssues = warnings.length > 0;

    return (
        <div className="p-4 border-t border-white/5 bg-[#1A202C]/50">
            <div className="flex items-center gap-2 mb-3">
                {hasIssues ? (
                    <AlertTriangle size={14} className="text-amber-400" />
                ) : (
                    <CheckCircle size={14} className="text-emerald-400" />
                )}
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Template Health
                </span>
            </div>

            {/* Tag Coverage */}
            <div className="flex items-center gap-2 mb-3 p-2 bg-slate-800/50 rounded-lg">
                <Tag size={12} className="text-purple-400" />
                <span className="text-[10px] text-slate-300">
                    {presentTags} semantic tag{presentTags !== 1 ? 's' : ''} defined
                </span>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="space-y-2 mb-3">
                    {warnings.map((warning, i) => (
                        <div key={i} className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-amber-200">{warning.message}</p>
                                    <p className="text-[9px] text-amber-400/70 mt-0.5">{warning.detail}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Tips */}
            {infos.length > 0 && (
                <div className="space-y-2">
                    {infos.map((info, i) => (
                        <div key={i} className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-blue-200">{info.message}</p>
                                    <p className="text-[9px] text-blue-400/70 mt-0.5">{info.detail}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {warnings.length === 0 && infos.length === 0 && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={12} className="text-emerald-400" />
                        <p className="text-[10px] font-bold text-emerald-200">Template looks great!</p>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Quick Fixes</p>
                <div className="flex flex-wrap gap-1.5">
                    {REQUIRED_SEMANTIC_TAGS.filter(t => !analysis.presentTags.has?.(t)).map(tag => (
                        <span key={tag} className="text-[9px] bg-purple-500/10 text-purple-300 px-2 py-1 rounded border border-purple-500/20">
                            Add {tag.replace(/_/g, ' ')}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
