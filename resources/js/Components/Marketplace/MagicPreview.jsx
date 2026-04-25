import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import KonvaPreview from '@/Components/Editor/Canvas/KonvaPreview';
import ScaleFit from '@/Components/ScaleFit';
import RepeaterEngine from '@/Utils/RepeaterEngine';
import { Sparkles } from 'lucide-react';

export default function MagicPreview({ canvasData, profile }) {
    // Process the canvas data with Magic Fill logic
    const magicData = useMemo(() => {
        if (!canvasData || !profile) return canvasData;

        try {
            // 1. Run Repeater Engine for list content
            const engine = new RepeaterEngine(canvasData, profile);
            let processed = engine.process();

            // 2. Run Basic Semantic Mapping (Single fields)
            // We can add a simple mapper for non-repeater tags here or integrate it into process()
            // For now, the RepeaterEngine already handles mapping for cloned items.
            // Let's add top-level mapping here for non-repeater elements.
            if (processed.pages) {
                processed.pages = processed.pages.map(page => ({
                    ...page,
                    elements: page.elements.map(el => {
                        if (el.semantic && !el.semantic.endsWith('_repeater')) {
                            const mapping = {
                                'full_name': profile.userDetail?.full_name,
                                'email': profile.userDetail?.email,
                                'phone': profile.userDetail?.phone,
                                'location': profile.userDetail?.address,
                                'summary': profile.userDetail?.professional_summary,
                                'position': profile.userDetail?.job_title || profile.experiences?.[0]?.position,
                                'linkedin': profile.userDetail?.linkedin,
                                'website': profile.userDetail?.website,
                            };
                            
                            if (mapping[el.semantic]) {
                                return { ...el, text: mapping[el.semantic] };
                            }

                            if (el.semantic === 'profile_photo' && profile.userDetail?.profile_photo_url) {
                                return { ...el, src: profile.userDetail.profile_photo_url };
                            }
                        }
                        return el;
                    })
                }));
            }

            return processed;
        } catch (error) {
            console.error('Magic Fill Error:', error);
            return canvasData;
        }
    }, [canvasData, profile]);

    const firstPageElements = magicData?.pages?.[0]?.elements || [];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative"
        >
            {/* High-quality Magic Badge */}
            <div className="absolute top-2 right-2 z-[30] flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-lg shadow-purple-500/20">
                <Sparkles size={10} className="animate-pulse" />
                <span>Magic Preview</span>
            </div>

            <ScaleFit width={595} height={842} className="w-full h-full bg-white origin-top transform-gpu">
                <KonvaPreview
                    pages={magicData?.pages || []}
                    elements={firstPageElements}
                    scale={1}
                    width={595}
                    height={842}
                />
            </ScaleFit>
        </motion.div>
    );
}
