const defaultConfig = {
    meta: {
        title: "For My Love"
    },
    theme: {
        backgroundStart: "#fff1f3",
        backgroundEnd: "#f6d9de",
        glow: "rgba(255, 164, 184, 0.38)",
        accent: "#b84f73",
        accentSoft: "#efb4c3",
        ink: "#4f2b35",
        muted: "#7f5c66",
        paper: "#fff9fa",
        paperShade: "#f3e1e7",
        envelopeBody: "#d86f8d",
        envelopeShadow: "#bf5a79",
        envelopeFlap: "#c85d7d",
        heart: "#d83a5d",
        seal: "#f0b8c6",
        sealShadow: "#c98297"
    },
    layout: {
        envelopeWidth: 320,
        envelopeHeight: 210,
        heartSize: 46,
        // How much of the envelope stays visible, tucked behind the bottom
        // of the letter, once it's fully open. Bigger = more envelope peeking out.
        envelopeOverlap: 46
    },
    copy: {
        eyebrow: "",
        title: "",
        subtitle: "",
        letterKicker: "",
        letterHeading: "",
        paragraphs: [
        ],
        signature: "",
        hintClosed: "",
        hintOpen: "",
        // Symbol stamped on the wax seal — swap for an initial, a heart, etc.
        sealSymbol: "❤"
    }
};

const root = document.documentElement;
const stage = document.getElementById('envelopeStage');
const envelope = document.getElementById('envelope');
const letterPanel = document.getElementById('letterPanel');
const seal = document.getElementById('seal');
const eyebrow = document.getElementById('eyebrow');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const letterKicker = document.getElementById('letterKicker');
const letterHeading = document.getElementById('letterHeading');
const letterBody = document.getElementById('letterBody');
const letterSignature = document.getElementById('letterSignature');
const hint = document.getElementById('hint');

let activeConfig = defaultConfig;

function deepMerge(base, override) {
    if (!override || typeof override !== 'object' || Array.isArray(override)) {
        return base;
    }

    const merged = { ...base };

    for (const [key, value] of Object.entries(override)) {
        if (value && typeof value === 'object' && !Array.isArray(value) && base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
            merged[key] = deepMerge(base[key], value);
            continue;
        }

        merged[key] = value;
    }

    return merged;
}

function applyTheme(config) {
    const { theme = {}, layout = {} } = config;

    root.style.setProperty('--bg-start', theme.backgroundStart || defaultConfig.theme.backgroundStart);
    root.style.setProperty('--bg-end', theme.backgroundEnd || defaultConfig.theme.backgroundEnd);
    root.style.setProperty('--bg-glow', theme.glow || defaultConfig.theme.glow);
    root.style.setProperty('--accent', theme.accent || defaultConfig.theme.accent);
    root.style.setProperty('--accent-soft', theme.accentSoft || defaultConfig.theme.accentSoft);
    root.style.setProperty('--ink', theme.ink || defaultConfig.theme.ink);
    root.style.setProperty('--muted', theme.muted || defaultConfig.theme.muted);
    root.style.setProperty('--paper', theme.paper || defaultConfig.theme.paper);
    root.style.setProperty('--paper-shade', theme.paperShade || defaultConfig.theme.paperShade);
    root.style.setProperty('--envelope-body', theme.envelopeBody || defaultConfig.theme.envelopeBody);
    root.style.setProperty('--envelope-shadow', theme.envelopeShadow || defaultConfig.theme.envelopeShadow);
    root.style.setProperty('--envelope-flap', theme.envelopeFlap || defaultConfig.theme.envelopeFlap);
    root.style.setProperty('--heart', theme.heart || defaultConfig.theme.heart);
    root.style.setProperty('--seal', theme.seal || defaultConfig.theme.seal);
    root.style.setProperty('--seal-shadow', theme.sealShadow || defaultConfig.theme.sealShadow);
    root.style.setProperty('--envelope-width', `${layout.envelopeWidth || defaultConfig.layout.envelopeWidth}px`);
    root.style.setProperty('--envelope-height', `${layout.envelopeHeight || defaultConfig.layout.envelopeHeight}px`);
    root.style.setProperty('--heart-size', `${layout.heartSize || defaultConfig.layout.heartSize}px`);
}

function renderCopy(config) {
    const { meta = {}, copy = {} } = config;

    document.title = meta.title || defaultConfig.meta.title;
    eyebrow.textContent = copy.eyebrow || defaultConfig.copy.eyebrow;
    pageTitle.textContent = copy.title || defaultConfig.copy.title;
    pageSubtitle.textContent = copy.subtitle || defaultConfig.copy.subtitle;
    letterKicker.textContent = copy.letterKicker || defaultConfig.copy.letterKicker;
    letterHeading.textContent = copy.letterHeading || defaultConfig.copy.letterHeading;
    letterSignature.textContent = copy.signature || defaultConfig.copy.signature;
    hint.textContent = copy.hintClosed || defaultConfig.copy.hintClosed;
    seal.setAttribute('data-symbol', copy.sealSymbol || defaultConfig.copy.sealSymbol);

    letterBody.innerHTML = '';

    const paragraphs = Array.isArray(copy.paragraphs) && copy.paragraphs.length > 0
        ? copy.paragraphs
        : defaultConfig.copy.paragraphs;

    paragraphs.forEach((paragraph) => {
        const node = document.createElement('p');
        node.textContent = paragraph;
        letterBody.appendChild(node);
    });
}

function getEnvelopeHeight(config) {
    return (config.layout && config.layout.envelopeHeight) || defaultConfig.layout.envelopeHeight;
}

function getOverlap(config) {
    return (config.layout && config.layout.envelopeOverlap) ?? defaultConfig.layout.envelopeOverlap;
}

// Lays out the stage/letter/envelope in exact pixels so the letter always
// shows its full content and the envelope always ends up tucked neatly
// behind the bottom of the letter — never clipped, never floating loose.
function layoutOpen(config) {
    const envelopeHeight = getEnvelopeHeight(config);
    const overlap = getOverlap(config);

    // Measure the letter's natural full height by briefly letting it size
    // itself, unclipped, before animating from 0 up to that number.
    letterPanel.style.transition = 'none';
    letterPanel.style.height = 'auto';
    const fullLetterHeight = letterPanel.scrollHeight;
    letterPanel.style.height = '0px';
    // Force layout so the browser registers the 0px height before we
    // animate away from it on the next frame.
    void letterPanel.offsetHeight;
    letterPanel.style.transition = '';

    const stageHeight = fullLetterHeight + envelopeHeight - overlap;
    const envelopeDrop = fullLetterHeight - overlap;

    requestAnimationFrame(() => {
        stage.style.height = `${stageHeight}px`;
        letterPanel.style.height = `${fullLetterHeight}px`;
        envelope.style.transform = `translateY(${Math.max(envelopeDrop, 0)}px)`;
    });
}

function layoutClosed(config) {
    const envelopeHeight = getEnvelopeHeight(config);

    stage.style.height = `${envelopeHeight}px`;
    letterPanel.style.height = '0px';
    envelope.style.transform = 'translateY(0px)';
}

function setEnvelopeState(isOpen, config) {
    envelope.classList.toggle('open', isOpen);
    envelope.classList.toggle('close', !isOpen);
    envelope.setAttribute('aria-expanded', String(isOpen));
    stage.classList.toggle('open', isOpen);

    if (isOpen) {
        layoutOpen(config);
    } else {
        layoutClosed(config);
    }

    hint.textContent = isOpen
        ? (config.copy.hintOpen || defaultConfig.copy.hintOpen)
        : (config.copy.hintClosed || defaultConfig.copy.hintClosed);
}

async function loadConfig() {
    try {
        const response = await fetch('./config.json', { cache: 'no-store' });

        if (!response.ok) {
            return defaultConfig;
        }

        const data = await response.json();
        return deepMerge(defaultConfig, data);
    } catch (error) {
        return defaultConfig;
    }
}

async function init() {
    activeConfig = await loadConfig();

    applyTheme(activeConfig);
    renderCopy(activeConfig);
    layoutClosed(activeConfig);

    envelope.addEventListener('click', () => {
        const isOpen = envelope.classList.contains('open');
        setEnvelopeState(!isOpen, activeConfig);
    });

    let resizeFrame = null;
    window.addEventListener('resize', () => {
        if (!envelope.classList.contains('open')) return;
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => layoutOpen(activeConfig));
    });
}

init();
