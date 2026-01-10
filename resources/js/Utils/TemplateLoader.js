/**
 * Template Loader - Converts user profile data to Polotno JSON format
 * Creates a Modern Professional template matching the design
 */

export const createModernTemplate = (userDetail, experiences = [], educations = [], skills = [], certifications = [], languages = []) => {
    // A4 dimensions in pixels at 72 DPI
    const PAGE_WIDTH = 595;
    const PAGE_HEIGHT = 842;
    const SIDEBAR_WIDTH = 200;
    const PADDING = 20;

    const children = [
        // Dark sidebar background
        {
            type: 'svg',
            name: 'sidebar-bg',
            x: 0,
            y: 0,
            width: SIDEBAR_WIDTH,
            height: PAGE_HEIGHT,
            src: `<svg width="${SIDEBAR_WIDTH}" height="${PAGE_HEIGHT}"><rect width="${SIDEBAR_WIDTH}" height="${PAGE_HEIGHT}" fill="#1e293b"/></svg>`,
            selectable: false,
            alwaysOnTop: false
        },

        // Profile Photo
        {
            type: 'image',
            name: 'profile-photo',
            x: (SIDEBAR_WIDTH - 100) / 2,
            y: 40,
            width: 100,
            height: 100,
            src: userDetail?.profile_photo_url || 'https://placehold.co/100',
            cornerRadius: 50
        },

        // Name
        {
            type: 'text',
            name: 'name',
            x: PADDING,
            y: 160,
            width: SIDEBAR_WIDTH - (PADDING * 2),
            text: (userDetail?.full_name || 'YOUR NAME').toUpperCase(),
            fontSize: 18,
            fontFamily: 'Inter',
            fontWeight: 900,
            fill: '#ffffff',
            align: 'center'
        },

        // Divider
        {
            type: 'line',
            name: 'divider',
            x: (SIDEBAR_WIDTH - 50) / 2,
            y: 200,
            points: [0, 0, 50, 0],
            stroke: '#6366f1',
            strokeWidth: 3
        },

        // Position/Title
        {
            type: 'text',
            name: 'position',
            x: PADDING,
            y: 220,
            width: SIDEBAR_WIDTH - (PADDING * 2),
            text: (experiences?.[0]?.position || 'PROFESSIONAL TITLE').toUpperCase(),
            fontSize: 10,
            fontFamily: 'Inter',
            fontWeight: 700,
            fill: '#94a3b8',
            align: 'center',
            letterSpacing: 1
        },

        // Contact Section Header
        {
            type: 'text',
            name: 'contact-header',
            x: PADDING,
            y: 260,
            width: SIDEBAR_WIDTH - (PADDING * 2),
            text: 'CONTACT',
            fontSize: 9,
            fontFamily: 'Inter',
            fontWeight: 900,
            fill: '#64748b',
            letterSpacing: 2
        },

        // Phone
        {
            type: 'text',
            name: 'phone',
            x: PADDING,
            y: 285,
            width: SIDEBAR_WIDTH - (PADDING * 2),
            text: userDetail?.phone || '+1 234 567 890',
            fontSize: 9,
            fontFamily: 'Inter',
            fill: '#cbd5e1'
        },

        // Email
        {
            type: 'text',
            name: 'email',
            x: PADDING,
            y: 305,
            width: SIDEBAR_WIDTH - (PADDING * 2),
            text: userDetail?.email || 'hello@example.com',
            fontSize: 9,
            fontFamily: 'Inter',
            fill: '#cbd5e1'
        },

        // Address
        {
            type: 'text',
            name: 'address',
            x: PADDING,
            y: 325,
            width: SIDEBAR_WIDTH - (PADDING * 2),
            text: userDetail?.address || 'City, Country',
            fontSize: 9,
            fontFamily: 'Inter',
            fill: '#cbd5e1'
        },

        // Skills Section Header
        {
            type: 'text',
            name: 'skills-header',
            x: PADDING,
            y: 365,
            width: SIDEBAR_WIDTH - (PADDING * 2),
            text: 'SKILLS & EXPERTISE',
            fontSize: 9,
            fontFamily: 'Inter',
            fontWeight: 900,
            fill: '#64748b',
            letterSpacing: 2
        }
    ];

    // Skills List
    const skillList = (skills && skills.length > 0 ? skills : [
        { name: 'Graphic Design' },
        { name: 'UI/UX Design' },
        { name: 'Branding' }
    ]).slice(0, 6);

    skillList.forEach((skill, i) => {
        children.push({
            type: 'text',
            name: `skill-${i}`,
            x: PADDING,
            y: 390 + (i * 20),
            width: SIDEBAR_WIDTH - (PADDING * 2),
            text: skill.name,
            fontSize: 9,
            fontFamily: 'Inter',
            fontWeight: 600,
            fill: '#cbd5e1'
        });
    });

    // Languages
    const langStart = 390 + (skillList.length * 20) + 20;
    children.push({
        type: 'text',
        name: 'languages-header',
        x: PADDING,
        y: langStart,
        width: SIDEBAR_WIDTH - (PADDING * 2),
        text: 'LANGUAGES',
        fontSize: 9,
        fontFamily: 'Inter',
        fontWeight: 900,
        fill: '#64748b',
        letterSpacing: 2
    });

    const languageList = (languages && languages.length > 0 ? languages : [{ name: 'English', proficiency: 'Native' }]).slice(0, 3);
    languageList.forEach((lang, i) => {
        children.push({
            type: 'text',
            name: `lang-${i}`,
            x: PADDING,
            y: langStart + 25 + (i * 20),
            width: SIDEBAR_WIDTH - (PADDING * 2),
            text: `${lang.name} - ${lang.proficiency || 'Fluent'}`,
            fontSize: 8,
            fontFamily: 'Inter',
            fill: '#cbd5e1'
        });
    });

    // Main Content
    children.push({
        type: 'text',
        name: 'profile-header',
        x: SIDEBAR_WIDTH + 30,
        y: 40,
        width: PAGE_WIDTH - SIDEBAR_WIDTH - 60,
        text: 'PROFESSIONAL PROFILE',
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: 900,
        fill: '#0f172a',
        letterSpacing: 1
    });

    children.push({
        type: 'text',
        name: 'summary',
        x: SIDEBAR_WIDTH + 30,
        y: 70,
        width: PAGE_WIDTH - SIDEBAR_WIDTH - 60,
        text: userDetail?.professional_summary || 'Brief professional summary here.',
        fontSize: 10,
        fontFamily: 'Inter',
        fill: '#475569',
        lineHeight: 1.5
    });

    // Experience
    children.push({
        type: 'text',
        name: 'experience-header',
        x: SIDEBAR_WIDTH + 30,
        y: 150,
        width: PAGE_WIDTH - SIDEBAR_WIDTH - 60,
        text: 'WORK EXPERIENCE',
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: 900,
        fill: '#0f172a',
        letterSpacing: 1
    });

    const expList = (experiences && experiences.length > 0 ? experiences : [{
        position: 'Job Title',
        company: 'Company Name',
        location: 'Location',
        start_date: '2020',
        end_date: 'Present',
        responsibilities: 'Describe your duties.'
    }]).slice(0, 3);

    expList.forEach((exp, i) => {
        const yStart = 185 + (i * 100);
        children.push({
            type: 'text',
            name: `exp-pos-${i}`,
            x: SIDEBAR_WIDTH + 30,
            y: yStart,
            width: 250,
            text: exp.position,
            fontSize: 12,
            fontFamily: 'Inter',
            fontWeight: 900,
            fill: '#0f172a'
        });
        children.push({
            type: 'text',
            name: `exp-date-${i}`,
            x: PAGE_WIDTH - 150,
            y: yStart,
            width: 120,
            text: `${exp.start_date} - ${exp.end_date || 'Present'}`,
            fontSize: 9,
            fontFamily: 'Inter',
            fontWeight: 700,
            fill: '#475569',
            align: 'right'
        });
        children.push({
            type: 'text',
            name: `exp-comp-${i}`,
            x: SIDEBAR_WIDTH + 30,
            y: yStart + 20,
            width: PAGE_WIDTH - SIDEBAR_WIDTH - 60,
            text: `${exp.company} | ${exp.location}`,
            fontSize: 10,
            fontFamily: 'Inter',
            fontWeight: 700,
            fill: '#6366f1'
        });
        children.push({
            type: 'text',
            name: `exp-desc-${i}`,
            x: SIDEBAR_WIDTH + 30,
            y: yStart + 40,
            width: PAGE_WIDTH - SIDEBAR_WIDTH - 60,
            text: exp.responsibilities,
            fontSize: 9,
            fontFamily: 'Inter',
            fill: '#475569',
            lineHeight: 1.4
        });
    });

    // Certifications
    const certStart = 185 + (expList.length * 100) + 20;
    children.push({
        type: 'text',
        name: 'certs-header',
        x: SIDEBAR_WIDTH + 30,
        y: certStart,
        width: PAGE_WIDTH - SIDEBAR_WIDTH - 60,
        text: 'CERTIFICATIONS',
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: 900,
        fill: '#0f172a'
    });

    const certList = (certifications && certifications.length > 0 ? certifications : [{ name: 'Relevant Certification' }]).slice(0, 3);
    certList.forEach((cert, i) => {
        children.push({
            type: 'text',
            name: `cert-${i}`,
            x: SIDEBAR_WIDTH + 30,
            y: certStart + 25 + (i * 20),
            width: PAGE_WIDTH - SIDEBAR_WIDTH - 60,
            text: `${cert.name} ${cert.issuing_organization ? `- ${cert.issuing_organization}` : ''}`,
            fontSize: 9,
            fontFamily: 'Inter',
            fill: '#475569'
        });
    });

    return {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        fonts: [],
        pages: [
            {
                id: 'page1',
                children: children,
                background: '#ffffff'
            }
        ]
    };
};
