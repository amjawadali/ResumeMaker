/**
 * Konva Template Loader - Premium Executive Template
 * Smartly converts user profile data to a well-organized Konva JSON layout.
 *
 * Key features:
 *  - Dynamic Y-position tracker so sections never overlap
 *  - Proper date formatting (ISO → "Mar 2019")
 *  - Intelligent text height estimation for multi-line content
 *  - All sections: Contact, Skills, Languages, Experience, Education, Certifications
 */

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Formats an ISO/date string to "Mon YYYY" (e.g. "Mar 2019").
 * Returns the raw value if parsing fails.
 */
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Already a simple year like "2021" or human text like "Present"
    if (/^\d{4}$/.test(dateStr) || /present/i.test(dateStr)) return dateStr;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

/**
 * Builds a readable date range string.
 */
const dateRange = (start, end, isCurrent = false) => {
    const s = formatDate(start);
    const e = isCurrent ? 'Present' : formatDate(end);
    if (!s && !e) return '';
    if (!e) return s;
    return `${s} – ${e}`;
};

/**
 * Estimates rendered text height for Konva text nodes.
 * Uses character-per-line heuristic based on width, fontSize, and lineHeight.
 */
const estimateTextHeight = (text, fontSize, lineHeight = 1.4, maxWidth = 295) => {
    if (!text) return fontSize * lineHeight;
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.55));
    const lines = text.split('\n');
    let totalLines = 0;
    lines.forEach(line => {
        totalLines += Math.max(1, Math.ceil((line.length || 1) / charsPerLine));
    });
    return totalLines * fontSize * lineHeight;
};

/**
 * Composes an address from user detail fields.
 */
const buildAddress = (ud) => {
    if (!ud) return 'New York, NY';
    const parts = [ud.city, ud.state, ud.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'New York, NY';
};

// ─── Template Builder ──────────────────────────────────────────────────────────

export const createPremiumTemplate = (
    userDetail,
    experiences = [],
    educations = [],
    skills = [],
    certifications = [],
    languages = []
) => {
    // ─── Layout Constants ──────────────────────────────────────────────────────
    const PAGE_WIDTH = 595;
    const PAGE_HEIGHT = 842;
    const SIDEBAR_W = 220;
    const PAD = 40;          // main content left/right padding from edges
    const MAIN_X = SIDEBAR_W + PAD;
    const MAIN_W = PAGE_WIDTH - SIDEBAR_W - PAD * 2;
    const SIDEBAR_PAD = 22;

    // ─── Color Palette ─────────────────────────────────────────────────────────
    const cBg       = '#0f172a';
    const cWhite    = '#ffffff';
    const cMuted    = '#cbd5e1';
    const cAccent   = '#4f46e5';
    const cHeading  = '#1e293b';
    const cBody     = '#475569';
    const cSub      = '#64748b';

    let elements = [];

    // ═══════════════════════════════════════════════════════════════════════════
    //  SIDEBAR (left column – fixed layout)
    // ═══════════════════════════════════════════════════════════════════════════

    // Background
    elements.push({
        id: 'sidebar-bg', type: 'rect', semantic: 'decoration',
        x: 0, y: 0, width: SIDEBAR_W, height: PAGE_HEIGHT,
        fill: cBg, draggable: false, selectable: false
    });

    // Profile Photo
    elements.push({
        id: 'profile-photo', type: 'image', semantic: 'profile_photo',
        x: (SIDEBAR_W - 110) / 2, y: 35, width: 110, height: 110,
        src: userDetail?.profile_photo_url || 'https://placehold.co/110',
        cornerRadius: 55, stroke: cAccent, strokeWidth: 3
    });

    let sideY = 165; // running Y for sidebar sections

    // ── Helper: add sidebar section heading with underline ──
    const addSidebarSection = (id, label) => {
        elements.push({
            id: `${id}-header`, type: 'text', semantic: 'section_header',
            x: SIDEBAR_PAD, y: sideY, text: label,
            fontSize: 11, fontFamily: 'Inter', fontStyle: '800',
            fill: cWhite, letterSpacing: 2
        });
        elements.push({
            id: `${id}-line`, type: 'rect', semantic: 'decoration',
            x: SIDEBAR_PAD, y: sideY + 16, width: 28, height: 2, fill: cAccent
        });
        sideY += 28;
    };

    // ── CONTACT ────────────────────────────────────────────────────────────────
    addSidebarSection('contact', 'CONTACT');

    const contactItems = [
        userDetail?.phone || '+1 234 567 8900',
        userDetail?.email || 'hello@example.com',
        buildAddress(userDetail),
        userDetail?.website || null,
        userDetail?.linkedin || null
    ].filter(Boolean);

    contactItems.forEach((text, i) => {
        elements.push({
            id: `contact-${i}`, type: 'text', semantic: 'contact_info',
            x: SIDEBAR_PAD, y: sideY, width: SIDEBAR_W - SIDEBAR_PAD * 2,
            text, fontSize: 9, fontFamily: 'Inter', fill: cMuted, lineHeight: 1.3
        });
        // estimate height of this line
        const h = estimateTextHeight(text, 9, 1.3, SIDEBAR_W - SIDEBAR_PAD * 2);
        sideY += Math.max(14, h + 3);
    });

    sideY += 10;

    // ── EXPERTISE (Skills) ─────────────────────────────────────────────────────
    const skillList = (skills && skills.length > 0 ? skills : [
        { name: 'UI/UX Design' }, { name: 'React & Vue' },
        { name: 'Node.js' }, { name: 'Project Management' }
    ]).slice(0, 10);

    if (skillList.length > 0) {
        addSidebarSection('skills', 'EXPERTISE');
        skillList.forEach((skill, i) => {
            elements.push({
                id: `skill-${i}`, type: 'text', semantic: 'skill_name',
                x: SIDEBAR_PAD, y: sideY, width: SIDEBAR_W - SIDEBAR_PAD * 2,
                text: `•  ${skill.name}`, fontSize: 9, fontFamily: 'Inter', fill: cMuted
            });
            sideY += 17;
        });
        sideY += 10;
    }

    // ── LANGUAGES ──────────────────────────────────────────────────────────────
    const langList = (languages && languages.length > 0 ? languages : []).slice(0, 5);

    if (langList.length > 0) {
        addSidebarSection('lang', 'LANGUAGES');
        langList.forEach((lang, i) => {
            elements.push({
                id: `lang-${i}`, type: 'text', semantic: 'language',
                x: SIDEBAR_PAD, y: sideY, width: SIDEBAR_W - SIDEBAR_PAD * 2,
                text: `${lang.name}  —  ${lang.proficiency}`,
                fontSize: 9, fontFamily: 'Inter', fill: cMuted
            });
            sideY += 17;
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  MAIN CONTENT (right column – dynamic flow)
    // ═══════════════════════════════════════════════════════════════════════════

    let mainY = PAD; // running Y tracker for main content

    // ── Helper: add main section heading with underline ──
    const addMainSection = (id, label) => {
        mainY += 8; // breathing room before header
        elements.push({
            id: `${id}-header`, type: 'text', semantic: 'section_header',
            x: MAIN_X, y: mainY, text: label,
            fontSize: 13, fontFamily: 'Inter', fontStyle: '900',
            fill: cHeading, letterSpacing: 1.5
        });
        elements.push({
            id: `${id}-hline`, type: 'rect', semantic: 'decoration',
            x: MAIN_X, y: mainY + 18, width: 36, height: 3, fill: cAccent
        });
        mainY += 30;
    };

    // ── NAME ───────────────────────────────────────────────────────────────────
    const fullName = (userDetail?.full_name || 'YOUR NAME').toUpperCase();
    elements.push({
        id: 'name', type: 'text', semantic: 'full_name',
        x: MAIN_X, y: mainY, width: MAIN_W,
        text: fullName, fontSize: 26, fontFamily: 'Inter',
        fontStyle: '900', fill: cHeading, letterSpacing: 1
    });
    mainY += 32;

    // ── PROFESSIONAL TITLE ────────────────────────────────────────────────────
    const title = (experiences?.[0]?.position || 'Professional Title').toUpperCase();
    elements.push({
        id: 'position', type: 'text', semantic: 'position',
        x: MAIN_X, y: mainY, width: MAIN_W,
        text: title, fontSize: 11, fontFamily: 'Inter',
        fontStyle: '700', fill: cAccent, letterSpacing: 1.2
    });
    mainY += 20;

    // ── Thin separator ─────────────────────────────────────────────────────────
    elements.push({
        id: 'name-sep', type: 'rect', semantic: 'decoration',
        x: MAIN_X, y: mainY, width: MAIN_W, height: 1, fill: '#e2e8f0'
    });
    mainY += 12;

    // ── PROFESSIONAL SUMMARY ──────────────────────────────────────────────────
    const summary = userDetail?.professional_summary ||
        'An innovative professional with a passion for designing and building exceptional digital experiences.';
    const summaryH = estimateTextHeight(summary, 9, 1.6, MAIN_W);
    elements.push({
        id: 'summary-text', type: 'text', semantic: 'professional_summary',
        x: MAIN_X, y: mainY, width: MAIN_W,
        text: summary, fontSize: 9, fontFamily: 'Inter',
        fill: cBody, lineHeight: 1.6
    });
    mainY += summaryH + 8;

    // ── WORK EXPERIENCE ───────────────────────────────────────────────────────
    const expList = (experiences && experiences.length > 0 ? experiences : [
        {
            position: 'Senior Product Designer',
            company: 'TechNova Solutions',
            start_date: '2021-01-01',
            end_date: null,
            currently_working: true,
            responsibilities: '• Led the UI/UX redesign of the flagship SaaS platform.\n• Managed a cross-functional team of 5 designers.'
        },
    ]).slice(0, 3);

    if (expList.length > 0) {
        addMainSection('exp', 'WORK EXPERIENCE');

        expList.forEach((exp, i) => {
            const dates = dateRange(exp.start_date, exp.end_date, exp.currently_working);

            // Title
            elements.push({
                id: `exp-title-${i}`, type: 'text', semantic: 'experience_title',
                x: MAIN_X, y: mainY, width: MAIN_W,
                text: exp.position, fontSize: 11, fontFamily: 'Inter',
                fontStyle: '900', fill: cHeading
            });
            mainY += 15;

            // Company + dates
            elements.push({
                id: `exp-company-${i}`, type: 'text', semantic: 'experience_company',
                x: MAIN_X, y: mainY, width: MAIN_W,
                text: `${exp.company}  |  ${dates}`,
                fontSize: 9, fontFamily: 'Inter', fontStyle: '600', fill: cSub
            });
            mainY += 15;

            // Description / Responsibilities
            if (exp.responsibilities) {
                const descH = estimateTextHeight(exp.responsibilities, 9, 1.5, MAIN_W);
                elements.push({
                    id: `exp-desc-${i}`, type: 'text', semantic: 'experience_description',
                    x: MAIN_X, y: mainY, width: MAIN_W,
                    text: exp.responsibilities, fontSize: 9, fontFamily: 'Inter',
                    fill: cBody, lineHeight: 1.5
                });
                mainY += descH + 4;
            }

            mainY += 8; // gap between entries
        });
    }

    // ── EDUCATION ──────────────────────────────────────────────────────────────
    const eduList = (educations && educations.length > 0 ? educations : [
        {
            degree: 'B.S. in Computer Science',
            institution: 'University of Technology',
            start_date: '2014-09-01',
            end_date: '2018-06-01'
        }
    ]).slice(0, 3);

    if (eduList.length > 0) {
        addMainSection('edu', 'EDUCATION');

        eduList.forEach((edu, i) => {
            const dates = dateRange(edu.start_date, edu.end_date, edu.currently_studying);

            // Degree
            elements.push({
                id: `edu-degree-${i}`, type: 'text', semantic: 'education_degree',
                x: MAIN_X, y: mainY, width: MAIN_W,
                text: edu.degree + (edu.field_of_study ? ` in ${edu.field_of_study}` : ''),
                fontSize: 11, fontFamily: 'Inter', fontStyle: '900', fill: cHeading
            });
            mainY += 15;

            // Institution + dates
            elements.push({
                id: `edu-inst-${i}`, type: 'text', semantic: 'education_institution',
                x: MAIN_X, y: mainY, width: MAIN_W,
                text: `${edu.institution}  |  ${dates}`,
                fontSize: 9, fontFamily: 'Inter', fontStyle: '600', fill: cSub
            });
            mainY += 15;

            // Optional GPA
            if (edu.gpa) {
                elements.push({
                    id: `edu-gpa-${i}`, type: 'text', semantic: 'education_gpa',
                    x: MAIN_X, y: mainY, width: MAIN_W,
                    text: `GPA: ${edu.gpa}`, fontSize: 9, fontFamily: 'Inter',
                    fill: cBody
                });
                mainY += 14;
            }

            mainY += 6;
        });
    }

    // ── CERTIFICATIONS ────────────────────────────────────────────────────────
    const certList = (certifications && certifications.length > 0 ? certifications : []).slice(0, 6);

    if (certList.length > 0) {
        addMainSection('cert', 'CERTIFICATIONS');

        certList.forEach((cert, i) => {
            elements.push({
                id: `cert-name-${i}`, type: 'text', semantic: 'certification_name',
                x: MAIN_X, y: mainY, width: MAIN_W,
                text: cert.name, fontSize: 10, fontFamily: 'Inter',
                fontStyle: '700', fill: cHeading
            });
            mainY += 14;

            elements.push({
                id: `cert-org-${i}`, type: 'text', semantic: 'certification_org',
                x: MAIN_X, y: mainY, width: MAIN_W,
                text: `${cert.issuing_organization}  |  ${formatDate(cert.issue_date)}`,
                fontSize: 9, fontFamily: 'Inter', fill: cSub
            });
            mainY += 18;
        });
    }

    return { elements };
};
