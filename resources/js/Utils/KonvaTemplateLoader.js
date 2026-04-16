/**
 * Konva Template Loader - Premium Executive Template (Jawad Ali Design)
 * Matches the provided screenshots exactly.
 * 
 * Features:
 * - Page 1: Sidebar (Contacts, Education) + Main (Name, Summary, Experience)
 * - Page 2+: Full-width layout for Projects and Skills
 * - Smart text wrapping and pagination
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

const estimateTextHeight = (text, fontSize, lineHeight = 1.4, maxWidth = 295) => {
    if (!text) return fontSize * lineHeight;
    // Estimate based on characters and explicit newlines
    const lines = text.split('\n');
    let totalLineCount = 0;
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.45)); // MORE CONSERVATIVE factor
    
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
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            return trimmed;
        }
        if (trimmed.startsWith('o') || trimmed.startsWith('+')) {
            return '    ' + trimmed;
        }
        return '• ' + trimmed;
    }).join('\n');
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
    // ─── Layout Constants ──────────────────────────────────────────────────────
    const PAGE_WIDTH  = 595;
    const PAGE_HEIGHT = 842;
    const PAD         = 40;
    
    // Page 1 Layout (Sidebar)
    const SIDEBAR_W   = 180;
    const MAIN_X      = SIDEBAR_W + PAD + 10;
    const MAIN_W      = PAGE_WIDTH - MAIN_X - PAD;
    
    // Page 2+ Layout (Full Width)
    const FULL_W      = PAGE_WIDTH - PAD * 2;

    // ─── Color Palette (Premium Minimalist) ────────────────────────────────────
    const cBlack    = '#000000';
    const cWhite    = '#ffffff';
    const cGray     = '#71717a'; // Muted text
    const cLine     = '#e4e4e7'; // Horizontal lines
    
    const pages = [];
    let currentElements = [];
    let curY = PAD;
    let isFirstPage = true;

    // ─── Utility: Section Header ──────────────────────────────────────────────
    const addSectionHeader = (label, x, y, width) => {
        currentElements.push({
            id: `header-${label.toLowerCase().replace(/\s/g, '-')}-${pages.length}`,
            type: 'text', text: label.toUpperCase(), x, y, width,
            fontSize: 12, fontFamily: 'Inter', fontStyle: '800', fill: cBlack,
            letterSpacing: 1
        });
        currentElements.push({
            id: `line-${label.toLowerCase().replace(/\s/g, '-')}-${pages.length}`,
            type: 'rect', x, y: y + 16, width, height: 1, fill: cGray
        });
        return y + 35;
    };

    const startNextPage = () => {
        const pageId = `p-${pages.length + 1}`;
        const pageElements = [];
        pages.push({ id: pageId, elements: pageElements });
        currentElements = pageElements;
        curY = PAD;
        isFirstPage = pages.length === 1;
        return pageId;
    };

    // ─── START PAGE 1 ────────────────────────────────────────────────────────
    startNextPage();

    // ─── Header (Name & Photo) ──────────────────────────────────────────────
    // Profile Photo
    currentElements.push({
        id: 'profile-photo', type: 'image', semantic: 'profile_photo',
        x: PAD, y: PAD, width: 100, height: 100,
        src: userDetail?.profile_photo_url || 'https://placehold.co/100',
        cornerRadius: 50
    });

    // Name & Title
    const nameText = (userDetail?.full_name || 'JAWAD ALI').toUpperCase();
    currentElements.push({
        id: 'full_name', type: 'text', semantic: 'full_name',
        x: MAIN_X, y: PAD + 10, width: MAIN_W,
        text: nameText, fontSize: 32, fontFamily: 'Inter', fontStyle: '900',
        fill: '#18181b', letterSpacing: 1
    });
    
    currentElements.push({
        id: 'job_title', type: 'text', semantic: 'position',
        x: MAIN_X, y: PAD + 55, width: MAIN_W,
        text: experiences?.[0]?.position || 'Web Developer',
        fontSize: 16, fontFamily: 'Inter', fontStyle: '500', fill: cGray
    });

    curY = PAD + 130;

    // ─── Contacts & About Me (Side-by-Side) ───────────────────────────────
    let sY = curY;
    let mY = curY;

    // Contacts
    sY = addSectionHeader('CONTACTS', PAD, sY, SIDEBAR_W);
    const contacts = [
        { text: userDetail?.phone || '03109865343', icon: '📞' },
        { text: userDetail?.email || 'codewithjawad@gmail.com', icon: '✉️' },
        { text: userDetail?.linkedin || 'jawadaliweb', icon: '🔗' }
    ];
    contacts.forEach((c, i) => {
        currentElements.push({
            id: `contact-icon-${i}`, type: 'text',
            x: PAD, y: sY, width: 20,
            text: c.icon, fontSize: 10, fontFamily: 'Inter', fill: cGray
        });
        currentElements.push({
            id: `contact-text-${i}`, type: 'text',
            x: PAD + 20, y: sY, width: SIDEBAR_W - 20,
            text: c.text, fontSize: 9.5, fontFamily: 'Inter', fontStyle: '500', fill: '#18181b'
        });
        sY += 20;
    });

    // About Me
    mY = addSectionHeader('ABOUT ME', MAIN_X, mY, MAIN_W);
    const summary = userDetail?.professional_summary || '';
    const sumH = estimateTextHeight(summary, 9.5, 1.5, MAIN_W);
    currentElements.push({
        id: 'summary', type: 'text',
        x: MAIN_X, y: mY, width: MAIN_W,
        text: summary, fontSize: 9.5, fontFamily: 'Inter', fill: '#27272a',
        lineHeight: 1.5, align: 'justify'
    });
    mY += sumH + 30;

    // Synchronize curY
    curY = Math.max(sY, mY) + 20;

    // ─── Education (Sequential Block) ─────────────────────────────────────
    curY = addSectionHeader('EDUCATION', PAD, curY, PAGE_WIDTH - PAD * 2);
    educations.forEach((edu, i) => {
        const dateText = dateRange(edu.start_date, edu.end_date, edu.currently_studying);
        const eduH = estimateTextHeight(edu.description, 9, 1.4, MAIN_W);
        const blockH = Math.max(40, eduH + 10);

        if (curY + blockH > PAGE_HEIGHT - PAD) {
            startNextPage();
            curY = addSectionHeader('EDUCATION (CONTINUED)', PAD, curY, PAGE_WIDTH - PAD * 2);
        }

        // Left Side: Date & Degree
        currentElements.push({
            id: `edu-date-${i}`, type: 'text',
            x: PAD, y: curY, width: SIDEBAR_W,
            text: dateText, fontSize: 9, fontFamily: 'Inter', fontStyle: '700', fill: cGray
        });
        currentElements.push({
            id: `edu-deg-${i}`, type: 'text',
            x: PAD, y: curY + 14, width: SIDEBAR_W,
            text: edu.degree, fontSize: 10, fontFamily: 'Inter', fontStyle: '700', fill: cBlack
        });

        // Right Side: Institution & Description
        currentElements.push({
            id: `edu-inst-${i}`, type: 'text',
            x: MAIN_X, y: curY, width: MAIN_W,
            text: edu.institution, fontSize: 11, fontFamily: 'Inter', fontStyle: '800', fill: cBlack
        });
        currentElements.push({
            id: `edu-desc-${i}`, type: 'text',
            x: MAIN_X, y: curY + 16, width: MAIN_W,
            text: edu.description, fontSize: 9, fontFamily: 'Inter', fill: '#3f3f46',
            lineHeight: 1.4
        });

        curY += blockH + 20;
    });

    // ─── Experience (Sequential Block) ────────────────────────────────────
    curY = addSectionHeader('EXPERIENCE', PAD, curY, PAGE_WIDTH - PAD * 2);
    experiences.forEach((exp, i) => {
        const dateStr = dateRange(exp.start_date, exp.end_date, exp.currently_working);
        const formattedResponsibilities = formatBullets(exp.responsibilities);
        const expH = estimateTextHeight(formattedResponsibilities, 9, 1.5, MAIN_W);
        const blockH = Math.max(50, expH + 25);

        if (curY + blockH > PAGE_HEIGHT - PAD) {
            startNextPage();
            curY = addSectionHeader('EXPERIENCE (CONTINUED)', PAD, curY, PAGE_WIDTH - PAD * 2);
        }

        // Left Side: Date & Company
        currentElements.push({
            id: `exp-date-${i}`, type: 'text',
            x: PAD, y: curY, width: SIDEBAR_W,
            text: dateStr, fontSize: 9, fontFamily: 'Inter', fontStyle: '700', fill: cGray
        });
        currentElements.push({
            id: `exp-comp-${i}`, type: 'text',
            x: PAD, y: curY + 14, width: SIDEBAR_W,
            text: exp.company, fontSize: 10, fontFamily: 'Inter', fontStyle: '800', fill: cBlack
        });

        // Right Side: Position & Responsibilities
        currentElements.push({
            id: `exp-pos-${i}`, type: 'text',
            x: MAIN_X, y: curY, width: MAIN_W,
            text: exp.position, fontSize: 11, fontFamily: 'Inter', fontStyle: '800', fill: cBlack
        });

        currentElements.push({
            id: `exp-desc-${i}`, type: 'text',
            x: MAIN_X, y: curY + 16, width: MAIN_W,
            text: formattedResponsibilities, fontSize: 9, fontFamily: 'Inter', fill: '#18181b',
            lineHeight: 1.5
        });

        curY += blockH + 15;
    });

    // ─── PROJECTS (PAGE 2+) ──────────────────────────────────────────────────
    if (curY > PAGE_HEIGHT / 2 || isFirstPage) {
        startNextPage();
        curY = PAD;
    }

    // ─── Project Sequential Logic ─────────────────────────────────────────
    if (pages.length === 1 || curY > PAGE_HEIGHT * 0.6) {
        startNextPage();
    }

    curY = addSectionHeader('PROJECTS', PAD, curY, PAGE_WIDTH - PAD * 2);

    const groupedProjects = (projects || []).reduce((acc, p) => {
        const cat = p.technologies || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    Object.entries(groupedProjects).forEach(([cat, projs]) => {
        currentElements.push({
            id: `proj-cat-${cat.replace(/\s/g, '-')}`, type: 'text',
            x: PAD, y: curY, width: PAGE_WIDTH - PAD * 2,
            text: cat, fontSize: 12, fontFamily: 'Inter', fontStyle: '800', fill: cBlack
        });
        curY += 25;

        projs.forEach((proj, i) => {
            const description = formatBullets(proj.description || '');
            const descH = estimateTextHeight(description, 9, 1.4, PAGE_WIDTH - PAD * 2 - 30);
            const blockH = descH + 40;

            if (curY + blockH > PAGE_HEIGHT - PAD) {
                startNextPage();
                curY = addSectionHeader('PROJECTS (CONTINUED)', PAD, curY, PAGE_WIDTH - PAD * 2);
            }

            currentElements.push({
                id: `proj-title-${cat}-${i}-${pages.length}`, type: 'text',
                x: PAD + 10, y: curY, width: PAGE_WIDTH - PAD * 2 - 20,
                text: `${proj.title} (${proj.url || ''})`,
                fontSize: 10, fontFamily: 'Inter', fontStyle: '800', fill: cBlack
            });
            curY += 18;

            currentElements.push({
                id: `proj-desc-${cat}-${i}-${pages.length}`, type: 'text',
                x: PAD + 25, y: curY, width: PAGE_WIDTH - PAD * 2 - 40,
                text: description, fontSize: 9, fontFamily: 'Inter', fill: '#18181b',
                lineHeight: 1.4
            });
            curY += descH + 15;
        });
    });

    if (curY > PAGE_HEIGHT - 150) {
        startNextPage();
    } else {
        curY += 30;
    }

    curY = addSectionHeader('SKILLS', PAD, curY, PAGE_WIDTH - PAD * 2);

    const fullWForSkills = PAGE_WIDTH - PAD * 2;
    const colW = fullWForSkills / 4;
    skills.forEach((skill, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const sX = PAD + (col * colW);
        const sY_skill = curY + (row * 18);
        currentElements.push({
            id: `skill-${i}-${pages.length}`, type: 'text',
            x: sX, y: sY_skill, width: colW - 5,
            text: `• ${skill.name}`, fontSize: 9, fontFamily: 'Inter', fill: '#18181b'
        });
    });

    return { pages };
};
