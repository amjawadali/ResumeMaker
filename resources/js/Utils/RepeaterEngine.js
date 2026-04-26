/**
 * RepeaterEngine.js
 * Handles cloning of Konva groups/elements for list-based content (Experience, Education, etc.)
 */

export default class RepeaterEngine {
    constructor(canvasData, profileData) {
        this.canvasData = JSON.parse(JSON.stringify(canvasData)); // Clone to avoid mutation
        this.profileData = profileData;
        this.yOffset = 0;
    }

    /**
     * Process the entire canvas for repeaters.
     */
    process() {
        if (!this.canvasData.pages) return this.canvasData;

        this.canvasData.pages = this.canvasData.pages.map(page => {
            return this.processPage(page);
        });

        return this.canvasData;
    }

    /**
     * Check if a semantic tag has corresponding profile data.
     * Used for conditional visibility of individual elements.
     */
    hasDataForSemantic(semantic) {
        if (!semantic) return true;
        const { userDetail, experiences, educations, skills, certifications, languages } = this.profileData;

        const tagMap = {
            'full_name': () => !!userDetail?.full_name,
            'email': () => !!userDetail?.email,
            'phone': () => !!userDetail?.phone,
            'location': () => !!(userDetail?.address || userDetail?.location),
            'summary': () => !!(userDetail?.professional_summary || userDetail?.summary),
            'position': () => !!(userDetail?.job_title || userDetail?.position || (experiences?.length > 0)),
            'linkedin': () => !!userDetail?.linkedin,
            'website': () => !!userDetail?.website,
            'profile_photo': () => !!userDetail?.profile_photo_url,
            'skill_name': () => skills?.length > 0,
            'experience_repeater': () => experiences?.length > 0,
            'experience_company': () => experiences?.length > 0,
            'experience_title': () => experiences?.length > 0,
            'experience_date': () => experiences?.length > 0,
            'education_repeater': () => educations?.length > 0,
            'education_school': () => educations?.length > 0,
            'education_degree': () => educations?.length > 0,
            'education_date': () => educations?.length > 0,
        };

        return (tagMap[semantic] ? tagMap[semantic]() : true);
    }

    /**
     * Apply smart truncation to text elements that exceed their defined bounds.
     */
    applySmartTruncation(element) {
        if (element.type !== 'text' || !element.width || !element.text) return element;

        const text = element.text;
        const maxWidth = element.width;
        const fontSize = element.fontSize || 12;
        const charWidth = fontSize * 0.55; // approximate average char width
        const maxChars = Math.floor(maxWidth / charWidth);

        if (text.length > maxChars) {
            return {
                ...element,
                text: text.substring(0, maxChars - 3) + '...',
                _truncated: true,
                _originalText: text
            };
        }
        return element;
    }

    /**
     * Process a single page.
     */
    processPage(page) {
        let newElements = [];
        let currentYShift = 0;

        // Sort elements by Y position to ensure layout shifts work top-to-bottom
        const sortedElements = [...page.elements].sort((a, b) => a.y - b.y);

        for (const element of sortedElements) {
            // Conditional visibility: skip elements whose semantic data is absent
            if (element.semantic && !element.semantic.endsWith('_repeater') && !element.semantic.endsWith('_heading')) {
                if (!this.hasDataForSemantic(element.semantic)) {
                    continue;
                }
            }

            // Check if this is a heading for a section that might be empty
            if (element.semantic && element.semantic.endsWith('_heading')) {
                const type = element.semantic.split('_')[0];
                const items = this.profileData[type + 's'] || [];
                if (items.length === 0) continue; // Skip (hide) heading if no items
            }

            // Apply current shift to standard elements
            element.y += currentYShift;

            if (element.semantic && element.semantic.endsWith('_repeater')) {
                const { clones, shift } = this.handleRepeater(element);
                newElements.push(...clones);
                currentYShift += shift;
            } else {
                // Apply smart truncation for text elements with overflow potential
                const processed = this.applySmartTruncation(element);
                newElements.push(processed);
            }
        }

        return { ...page, elements: newElements };
    }

    /**
     * Clone an element or group based on its semantic repeater tag.
     */
    handleRepeater(repeaterElement) {
        const type = repeaterElement.semantic.split('_')[0]; // 'experience' or 'education'
        const items = this.profileData[type + 's'] || []; // e.g. profileData.experiences

        if (items.length === 0) {
            return { clones: [], shift: -repeaterElement.height - 20 }; // Remove and shrink space
        }

        let clones = [];
        let totalShift = 0;
        const spacing = 20; // Default vertical spacing between items

        items.forEach((item, index) => {
            const clone = JSON.parse(JSON.stringify(repeaterElement));
            clone.id = `${repeaterElement.id}-clone-${index}`;
            clone.y = repeaterElement.y + (index * (repeaterElement.height + spacing));

            // Map data into the clone
            this.mapItemData(clone, item, type);

            clones.push(clone);
            if (index > 0) {
                totalShift += repeaterElement.height + spacing;
            }
        });

        return { clones, shift: totalShift };
    }

    /**
     * Map specific profile item data into a cloned group's children.
     */
    mapItemData(element, item, context) {
        if (element.type === 'group' && element.elements) {
            element.elements.forEach(child => {
                this.fillChild(child, item, context);
            });
        } else {
            this.fillChild(element, item, context);
        }
    }

    /**
     * Helper to fill a single child element with data.
     */
    fillChild(child, item, context) {
        if (!child.semantic) return;

        const mapping = {
            'experience': {
                'experience_company': item.company || item.employer,
                'experience_title': item.position || item.job_title,
                'experience_date': `${item.start_date} - ${item.end_date || 'Present'}`,
                'experience_description': item.description,
                'experience_location': item.location
            },
            'education': {
                'education_school': item.school || item.university,
                'education_degree': item.degree || item.qualification,
                'education_date': `${item.start_date} - ${item.end_date || 'Present'}`,
                'education_description': item.description
            },
            'certification': {
                'certification_name': item.name || item.title,
                'certification_issuer': item.issuer || item.organization,
                'certification_date': item.date || item.issue_date
            }
        };

        const value = mapping[context]?.[child.semantic];
        if (value) {
            child.text = value;
            // Apply smart truncation after filling data
            this.applySmartTruncation(child);
        }
    }
}
