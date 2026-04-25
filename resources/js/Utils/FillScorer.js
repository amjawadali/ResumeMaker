/**
 * FillScorer.js
 * Calculates how much of a template will be filled by a user's profile.
 */

export default class FillScorer {
    static analyze(canvasData, profile) {
        if (!canvasData || !profile) return { score: 0, missing: [] };

        const semanticTags = this.extractSemanticTags(canvasData);
        if (semanticTags.length === 0) return { score: 100, missing: [] };

        const uniqueTags = [...new Set(semanticTags)];
        const missing = [];
        let filledCount = 0;

        uniqueTags.forEach(tag => {
            if (this.isTagFilled(tag, profile)) {
                filledCount++;
            } else {
                missing.push(tag);
            }
        });

        return {
            score: Math.round((filledCount / uniqueTags.length) * 100),
            missing: missing
        };
    }

    static score(canvasData, profile) {
        return this.analyze(canvasData, profile).score;
    }

    static extractSemanticTags(canvasData) {
        let tags = [];
        if (!canvasData.pages) return tags;

        canvasData.pages.forEach(page => {
            page.elements.forEach(el => {
                if (el.semantic) {
                    tags.push(el.semantic);
                }
                if (el.type === 'group' && el.elements) {
                    el.elements.forEach(child => {
                        if (child.semantic) tags.push(child.semantic);
                    });
                }
            });
        });

        return tags;
    }

    static isTagFilled(tag, profile) {
        const { userDetail, experiences, educations, skills } = profile;

        // Personal Info
        if (['full_name', 'email', 'phone', 'location', 'summary', 'linkedin', 'website'].includes(tag)) {
            return !!userDetail?.[tag] || (tag === 'location' && !!userDetail?.address);
        }

        if (tag === 'profile_photo') return !!userDetail?.profile_photo_url;

        // Repeaters
        if (tag === 'experience_repeater') return experiences?.length > 0;
        if (tag === 'education_repeater') return educations?.length > 0;

        // Individual Repeater Fields
        if (tag.startsWith('experience_')) return experiences?.length > 0;
        if (tag.startsWith('education_')) return educations?.length > 0;
        
        if (tag === 'skill_name') return skills?.length > 0;
        if (tag === 'position') return !!userDetail?.job_title || experiences?.length > 0;

        return false;
    }
}
