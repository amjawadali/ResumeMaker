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
     * Process a single page.
     */
    processPage(page) {
        let newElements = [];
        let currentYShift = 0;

        // Sort elements by Y position to ensure layout shifts work top-to-bottom
        const sortedElements = [...page.elements].sort((a, b) => a.y - b.y);

        for (const element of sortedElements) {
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
                newElements.push(element);
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
            }
        };

        const value = mapping[context]?.[child.semantic];
        if (value) {
            child.text = value;
        }
    }
}
