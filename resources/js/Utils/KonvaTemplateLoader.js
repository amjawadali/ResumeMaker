/**
 * Konva Template Loader - Premium Executive Template (Smarter Version)
 * 
 * Features:
 * - Smart Sorting: Most recent Experience/Education first.
 * - Multi-Page aware: Dynamic Y-positioning and automatic page breaks.
 * - Full Sections: Header, Summary, Experience, Education, Skills, Certifications, Languages, Projects.
 */

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}$/.test(dateStr) || /present/i.test(dateStr)) return dateStr;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

const dateRange = (start, end, isCurrent = false) => {
    const s = formatDate(start);
    const e = isCurrent ? 'Present' : formatDate(end);
    if (!s && !e) return '';
    if (!e) return s;
    return `${s} – ${e}`;
};

/**
 * Estimates rendered text height for Konva text nodes.
 */
const estimateTextHeight = (text, fontSize, lineHeight = 1.4, maxWidth = 295) => {
    if (!text) return fontSize * lineHeight;
    const lines = text.split('\n');
    let totalLineCount = 0;
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.45));
    
    lines.forEach(line => {
        const wrappedLines = Math.max(1, Math.ceil((line.trim().length + 2) / charsPerLine));
        totalLineCount += wrappedLines;
    });
    
    return totalLineCount * fontSize * lineHeight;
};

const formatBullets = (text) => {
    if (!text) return '';
    return text.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            return trimmed;
        }
        return '• ' + trimmed;
    }).filter(Boolean).join('\n');
};

/**
 * Sorts an array of objects by a date field descending.
 */
const sortByDate = (arr, dateKey = 'start_date') => {
    return [...arr].sort((a, b) => {
        const dateA = a[dateKey] ? new Date(a[dateKey]) : new Date(0);
        const dateB = b[dateKey] ? new Date(b[dateKey]) : new Date(0);
        return dateB - dateA;
    });
};

// ─── Template Builder ──────────────────────────────────────────────────────────

export const createPremiumTemplate = (
    userDetail,
    experiences = [],
    educations = [],
    skills = [],
    certifications = [],
    languages = [],
    projects = []
) => {
    // ─── Data Pre-processing (SMART) ──────────────────────────────────────────
    const sortedExperiences = sortByDate(experiences);
    const sortedEducations = sortByDate(educations);
    const sortedCertifications = sortByDate(certifications, 'issue_date');

    // ─── Layout Constants ──────────────────────────────────────────────────────
    const PAGE_WIDTH  = 595;
    const PAGE_HEIGHT = 842;
    const PAD         = 40;
    
    // Page 1 Layout (Sidebar)
    const SIDEBAR_W   = 180;
    const MAIN_X      = SIDEBAR_W + PAD + 15; // Increased gap
    const MAIN_W      = PAGE_WIDTH - MAIN_X - PAD;
    
    const cBlack    = '#18181b';
    const cGray     = '#71717a';
    const cLine     = '#e4e4e7';
    const cAccent   = '#4f46e5';

    const pages = [];
    let currentElements = [];
    let curY = PAD;

    const startNextPage = () => {
        const pageId = `p-${pages.length + 1}`;
        const pageElements = [];
        pages.push({ id: pageId, elements: pageElements });
        currentElements = pageElements;
        curY = PAD;
        
        // Add vertical line for Page 1 sidebar
        if (pages.length === 1) {
            currentElements.push({
                id: 'sidebar-sep', type: 'rect',
                x: SIDEBAR_W + PAD + 5, y: PAD, width: 1, height: PAGE_HEIGHT - PAD * 2,
                fill: cLine
            });
        }
        return pageId;
    };

    const addSectionHeader = (label, x, y, width, isSidebar = false) => {
        currentElements.push({
            id: `header-${label.toLowerCase().replace(/\s/g, '-')}-${pages.length}`,
            type: 'text', text: label.toUpperCase(), x, y, width,
            fontSize: isSidebar ? 10 : 12, fontFamily: 'Inter', fontStyle: '900', fill: cBlack,
            letterSpacing: 1.5
        });
        currentElements.push({
            id: `line-${label.toLowerCase().replace(/\s/g, '-')}-${pages.length}`,
            type: 'rect', x, y: y + (isSidebar ? 14 : 16), width: isSidebar ? 30 : 40, height: 2, fill: cAccent
        });
        return y + (isSidebar ? 30 : 35);
    };

    // ─── INITIALIZE PAGE 1 ────────────────────────────────────────────────────
    startNextPage();

    // ─── Header ───────────────────────────────────────────────────────────────
    // Profile Photo
    currentElements.push({
        id: 'profile-photo', type: 'image', semantic: 'profile_photo',
        x: PAD, y: PAD, width: 80, height: 80,
        src: userDetail?.profile_photo_url || 'https://placehold.co/80',
        cornerRadius: 40
    });

    // Name & Title
    const nameText = (userDetail?.full_name || 'JOHN CARTER').toUpperCase();
    currentElements.push({
        id: 'full_name', type: 'text', semantic: 'full_name',
        x: MAIN_X, y: PAD, width: MAIN_W,
        text: nameText, fontSize: 28, fontFamily: 'Inter', fontStyle: '900',
        fill: cBlack, letterSpacing: 1
    });
    
    currentElements.push({
        id: 'job_title', type: 'text', semantic: 'position',
        x: MAIN_X, y: PAD + 40, width: MAIN_W,
        text: sortedExperiences?.[0]?.position || 'Professional Title',
        fontSize: 14, fontFamily: 'Inter', fontStyle: '600', fill: cAccent
    });

    curY = PAD + 100;

    // ─── Sidebar Content (Contacts, Languages, Skills) ──────────────────────
    let sideY = curY;
    
    // Contacts
    sideY = addSectionHeader('CONTACT', PAD, sideY, SIDEBAR_W, true);
    const contacts = [
        { text: userDetail?.phone || '03109865343', icon: '📞' },
        { text: userDetail?.email || 'admin@resumemaker.com', icon: '✉️' },
        { text: userDetail?.linkedin || 'linkedin.com/in/john', icon: '🔗' },
        { text: `${userDetail?.city || 'San Francisco'}, ${userDetail?.state || 'CA'}`, icon: '📍' }
    ];
    contacts.forEach((c, i) => {
        currentElements.push({
            id: `contact-icon-${i}`, type: 'text', x: PAD, y: sideY, width: 15,
            text: c.icon, fontSize: 8, fill: cGray
        });
        currentElements.push({
            id: `contact-text-${i}`, type: 'text', x: PAD + 15, y: sideY, width: SIDEBAR_W - 15,
            text: c.text, fontSize: 9, fontFamily: 'Inter', fontStyle: '500', fill: cBlack
        });
        sideY += 16;
    });

    sideY += 20;

    // Languages
    if (languages && languages.length > 0) {
        sideY = addSectionHeader('LANGUAGES', PAD, sideY, SIDEBAR_W, true);
        languages.forEach((lang, i) => {
            currentElements.push({
                id: `lang-name-${i}`, type: 'text', x: PAD, y: sideY, width: SIDEBAR_W,
                text: lang.name, fontSize: 9, fontFamily: 'Inter', fontStyle: '700', fill: cBlack
            });
            currentElements.push({
                id: `lang-prof-${i}`, type: 'text', x: PAD, y: sideY + 11, width: SIDEBAR_W,
                text: lang.proficiency, fontSize: 8, fontFamily: 'Inter', fill: cGray
            });
            sideY += 28;
        });
        sideY += 10;
    }

    // Skills (Sidebar)
    if (skills && skills.length > 0) {
        sideY = addSectionHeader('EXPERTISE', PAD, sideY, SIDEBAR_W, true);
        skills.slice(0, 8).forEach((skill, i) => {
            currentElements.push({
                id: `skill-side-${i}`, type: 'text', x: PAD, y: sideY, width: SIDEBAR_W,
                text: `• ${skill.name}`, fontSize: 9, fontFamily: 'Inter', fill: cBlack
            });
            sideY += 16;
        });
    }

    // ─── Main Content Content (Summary, Experience, Education) ────────────────
    let mainY = curY;

    // Summary
    mainY = addSectionHeader('ABOUT ME', MAIN_X, mainY, MAIN_W);
    const summary = userDetail?.professional_summary || '';
    const sumH = estimateTextHeight(summary, 9, 1.6, MAIN_W);
    currentElements.push({
        id: 'summary', type: 'text', x: MAIN_X, y: mainY, width: MAIN_W,
        text: summary, fontSize: 9, fontFamily: 'Inter', fill: '#3f3f46',
        lineHeight: 1.6, align: 'justify'
    });
    mainY += sumH + 30;

    // Experience
    mainY = addSectionHeader('EXPERIENCE', MAIN_X, mainY, MAIN_W);
    sortedExperiences.forEach((exp, i) => {
        const dateStr = dateRange(exp.start_date, exp.end_date, exp.currently_working);
        const bullets = formatBullets(exp.responsibilities);
        const expH = estimateTextHeight(bullets, 9, 1.5, MAIN_W);
        const blockH = expH + 45;

        if (mainY + blockH > PAGE_HEIGHT - PAD) {
            startNextPage();
            mainY = addSectionHeader('EXPERIENCE (CONT.)', MAIN_X, mainY, MAIN_W);
        }

        currentElements.push({
            id: `exp-title-${i}`, type: 'text', x: MAIN_X, y: mainY, width: MAIN_W,
            text: exp.position, fontSize: 11, fontFamily: 'Inter', fontStyle: '800', fill: cBlack
        });
        currentElements.push({
            id: `exp-comp-${i}`, type: 'text', x: MAIN_X, y: mainY + 14, width: MAIN_W,
            text: `${exp.company} | ${dateStr}`, fontSize: 9, fontFamily: 'Inter', fontStyle: '600', fill: cAccent
        });
        currentElements.push({
            id: `exp-desc-${i}`, type: 'text', x: MAIN_X, y: mainY + 28, width: MAIN_W,
            text: bullets, fontSize: 9, fontFamily: 'Inter', fill: '#18181b', lineHeight: 1.5
        });

        mainY += blockH + 15;
    });

    // Education
    if (mainY + 100 > PAGE_HEIGHT - PAD) {
        startNextPage();
    }
    mainY = addSectionHeader('EDUCATION', MAIN_X, mainY, MAIN_W);
    sortedEducations.forEach((edu, i) => {
        const dateText = dateRange(edu.start_date, edu.end_date, edu.currently_studying);
        const blockH = 45;

        if (mainY + blockH > PAGE_HEIGHT - PAD) {
            startNextPage();
            mainY = addSectionHeader('EDUCATION (CONT.)', MAIN_X, mainY, MAIN_W);
        }

        currentElements.push({
            id: `edu-deg-${i}`, type: 'text', x: MAIN_X, y: mainY, width: MAIN_W,
            text: edu.degree + (edu.field_of_study ? ` - ${edu.field_of_study}` : ''),
            fontSize: 10, fontFamily: 'Inter', fontStyle: '800', fill: cBlack
        });
        currentElements.push({
            id: `edu-inst-${i}`, type: 'text', x: MAIN_X, y: mainY + 14, width: MAIN_W,
            text: `${edu.institution} | ${dateText}`, fontSize: 9, fontFamily: 'Inter', fontStyle: '600', fill: cGray
        });

        mainY += blockH;
    });

    // ─── Certifications & Projects (Page 2+) ──────────────────────────────────
    if (sortedCertifications.length > 0 || (projects && projects.length > 0)) {
        if (mainY > PAGE_HEIGHT * 0.7) {
            startNextPage();
            mainY = PAD;
        } else {
            mainY += 20;
        }

        // Certifications
        if (sortedCertifications.length > 0) {
            mainY = addSectionHeader('CERTIFICATIONS', MAIN_X, mainY, MAIN_W);
            sortedCertifications.forEach((cert, i) => {
                const blockH = 35;
                if (mainY + blockH > PAGE_HEIGHT - PAD) {
                    startNextPage();
                    mainY = addSectionHeader('CERTIFICATIONS (CONT.)', MAIN_X, mainY, MAIN_W);
                }
                currentElements.push({
                    id: `cert-name-${i}`, type: 'text', x: MAIN_X, y: mainY, width: MAIN_W,
                    text: cert.name, fontSize: 10, fontFamily: 'Inter', fontStyle: '800', fill: cBlack
                });
                currentElements.push({
                    id: `cert-org-${i}`, type: 'text', x: MAIN_X, y: mainY + 14, width: MAIN_W,
                    text: `${cert.issuing_organization} | ${formatDate(cert.issue_date)}`,
                    fontSize: 9, fontFamily: 'Inter', fill: cGray
                });
                mainY += blockH;
            });
            mainY += 20;
        }

        // Projects
        if (projects && projects.length > 0) {
            mainY = addSectionHeader('PROJECTS', MAIN_X, mainY, MAIN_W);
            projects.forEach((proj, i) => {
                const bullets = formatBullets(proj.description || '');
                const descH = estimateTextHeight(bullets, 9, 1.4, MAIN_W);
                const blockH = descH + 30;

                if (mainY + blockH > PAGE_HEIGHT - PAD) {
                    startNextPage();
                    mainY = addSectionHeader('PROJECTS (CONT.)', MAIN_X, mainY, MAIN_W);
                }

                currentElements.push({
                    id: `proj-title-${i}`, type: 'text', x: MAIN_X, y: mainY, width: MAIN_W,
                    text: proj.title, fontSize: 10, fontFamily: 'Inter', fontStyle: '800', fill: cBlack
                });
                currentElements.push({
                    id: `proj-desc-${i}`, type: 'text', x: MAIN_X, y: mainY + 16, width: MAIN_W,
                    text: bullets, fontSize: 9, fontFamily: 'Inter', fill: '#18181b', lineHeight: 1.4
                });
                mainY += blockH + 10;
            });
        }
    }

    return { pages };
};
