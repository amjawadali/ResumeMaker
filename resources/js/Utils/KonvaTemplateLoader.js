/**
 * Konva Template Loader - Converts user profile data to Konva JSON format
 * Creates a Modern Professional template matching the design
 */

export const createKonvaModernTemplate = (userDetail, experiences = [], educations = [], skills = [], certifications = [], languages = []) => {
    const PADDING = 40;
    const SIDEBAR_WIDTH = 200;
    const PAGE_WIDTH = 595;

    let elements = [
        // Dark sidebar background
        {
            id: 'sidebar-bg',
            type: 'rect',
            semantic: 'decoration',
            x: 0,
            y: 0,
            width: SIDEBAR_WIDTH,
            height: 842,
            fill: '#1e293b',
            draggable: false,
            selectable: false
        },

        // Profile Photo
        {
            id: 'profile-photo',
            type: 'image',
            semantic: 'profile_photo',
            x: (SIDEBAR_WIDTH - 100) / 2,
            y: 40,
            width: 100,
            height: 100,
            src: userDetail?.profile_photo_url || 'https://placehold.co/100',
            cornerRadius: 50
        },

        // Name
        {
            id: 'name',
            type: 'text',
            semantic: 'full_name',
            x: 20,
            y: 160,
            width: SIDEBAR_WIDTH - 40,
            text: (userDetail?.full_name || 'YOUR NAME').toUpperCase(),
            fontSize: 18,
            fontFamily: 'Inter',
            fontStyle: '900',
            fill: '#ffffff',
            align: 'center'
        },

        // Professional Title
        {
            id: 'position',
            type: 'text',
            semantic: 'position',
            x: 20,
            y: 220,
            width: SIDEBAR_WIDTH - 40,
            text: (experiences?.[0]?.position || 'PROFESSIONAL TITLE').toUpperCase(),
            fontSize: 10,
            fontFamily: 'Inter',
            fontStyle: '700',
            fill: '#94a3b8',
            align: 'center'
        },

        // Summary Header
        {
            id: 'summary-header',
            type: 'text',
            semantic: 'section_header',
            x: SIDEBAR_WIDTH + 30,
            y: 40,
            text: 'PROFESSIONAL PROFILE',
            fontSize: 14,
            fontFamily: 'Inter',
            fontStyle: '900',
            fill: '#0f172a'
        },

        // Summary Text
        {
            id: 'summary-text',
            type: 'text',
            semantic: 'professional_summary',
            x: SIDEBAR_WIDTH + 30,
            y: 70,
            width: PAGE_WIDTH - SIDEBAR_WIDTH - 60,
            text: userDetail?.professional_summary || 'Brief professional summary here.',
            fontSize: 10,
            fontFamily: 'Inter',
            fill: '#475569',
            lineHeight: 1.5
        }
    ];

    // Experience Header (Decorative)
    elements.push({
        id: 'experience-header',
        type: 'text',
        semantic: 'section_header',
        x: SIDEBAR_WIDTH + 30,
        y: 150,
        text: 'WORK EXPERIENCE',
        fontSize: 14,
        fontFamily: 'Inter',
        fontStyle: '900',
        fill: '#0f172a'
    });

    // Add Experiences
    const expList = (experiences && experiences.length > 0 ? experiences : [{
        position: 'Job Title',
        company: 'Company Name',
        start_date: '2020',
        end_date: 'Present',
        responsibilities: 'Describe your duties.'
    }]).slice(0, 3);

    expList.forEach((exp, i) => {
        const yStart = 185 + (i * 100);
        elements.push({
            id: `exp-title-${i}`,
            type: 'text',
            semantic: 'experience_title',
            x: SIDEBAR_WIDTH + 30,
            y: yStart,
            text: exp.position,
            fontSize: 11,
            fontFamily: 'Inter',
            fontStyle: '900',
            fill: '#0f172a'
        });
        elements.push({
            id: `exp-company-${i}`,
            type: 'text',
            semantic: 'experience_company',
            x: SIDEBAR_WIDTH + 30,
            y: yStart + 15,
            text: `${exp.company} | ${exp.start_date} - ${exp.end_date || 'Present'}`,
            fontSize: 9,
            fontFamily: 'Inter',
            fontStyle: '700',
            fill: '#6366f1'
        });
        elements.push({
            id: `exp-desc-${i}`,
            type: 'text',
            semantic: 'experience_description',
            x: SIDEBAR_WIDTH + 30,
            y: yStart + 30,
            width: PAGE_WIDTH - SIDEBAR_WIDTH - 60,
            text: exp.responsibilities,
            fontSize: 9,
            fontFamily: 'Inter',
            fill: '#475569',
            lineHeight: 1.4
        });
    });

    return { elements };
};
