/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// import { GoogleGenAI, type Content } from "@google/genai"; // <<< EZT A SORT TÖRÖLD/KOMMENTELD KI
import markdownit from 'markdown-it';
import {sanitizeHtml} from 'safevalues';
import {setElementInnerHtml} from 'safevalues/dom';

// Define a simple type for chat history that matches what the backend expects
type ChatContent = {
    role: 'user' | 'model';
    parts: { text: string }[];
};


// --- CONFIGURATION ---
const TOTAL_ARTWORKS = 10;
const ARTWORK_PATHS = Array.from({ length: TOTAL_ARTWORKS }, (_, i) => `${i + 1}.jpeg`);

// System instructions for the chat model. Ezeket most már a backend is kezeli,
// de itt is jó, ha megvan a nyelvi váltáshoz vagy referencia célra.
const chatSystemInstructions = {
    hu: "Te vagy a virtuális kurátor Giada Fervere 'A Láthatatlan Visszhangjai' című kiállításán. A helyszín: KORTÁRS KÉPZŐMŰVÉSZETI GALÉRIA, V. BUDAPEST, MAGYAR U. 44. A megnyitó 2025. augusztus 15-én 18:00-kor lesz. A személyiséged műértő, lelkes és segítőkész. Adj rövid, de informatív és inspiráló válaszokat a kiállítással, a művésszel, az új helyszínnel és dátummal, vagy az absztrakt művészettel kapcsolatos kérdésekre. Használj magyar nyelvet.",
    en: "You are the virtual curator for Giada Fervere's exhibition, 'Echoes of the Unseen'. The venue is: CONTEMPORARY ART GALLERY, 44 MAGYAR ST, DISTRICT V, BUDAPEST. The opening is at 18:00 on August 15, 2025. Your persona is knowledgeable, enthusiastic, and helpful. Provide concise, yet informative and inspiring answers to questions about the exhibition, the artist, the new venue and date, or abstract art in general. Use English language."
};

const locales = {
    hu: {
        pageTitle: "Giada Fervere | A Láthatatlan Visszhangjai",
        artistName: "Giada Fervere",
        exhibitionTitle: "A Láthatatlan Visszhangjai",
        galleryName: "KORTÁRS KÉPZŐMŰVÉSZETI GALÉRIA",
        galleryAddress: "V. BUDAPEST, MAGYAR U. 44.",
        exhibitionDate: "MEGNYITÓ: 2025. 08. 15. 18:00",
        chatTitle: "Kérdezz a kurátortól",
        chatHeader: "Kérdezd a kurátort",
        chatPlaceholder: "Tegyél fel egy kérdést...",
        chatSendTitle: "Küldés",
        menuAbout: "Rólam",
        menuGallery: "Galéria",
        menuCurator: "Kurátor",
        menuPerformance: "Zene, Vers, Előadás",
        aboutTitle: "A Művészről",
        aboutContent: "Munkásságom egy tükör, melyet a létezés kettősségének tartok. Minden ecsetvonással a fény és az árnyék, a teremtés és az enyészet, a nyugalodt és a kaotikus között keresem az egyensúlyt.",
        performanceTitle: "Betekintés: Zene, Vers és Előadás",
        performanceContent: "„…így szólok még a fül, a száj és a szem hangján.” A YouTube csatornámon megtekinthetőek a zenei, költészeti és előadói munkáim. Kattintson az alábbi gombra!",
        performanceYoutubeButton: "Megtekintés a YouTube-on",
    },
    en: {
        pageTitle: "Giada Fervere | Echoes of the Unseen",
        artistName: "Giada Fervere",
        exhibitionTitle: "Echoes of the Unseen",
        galleryName: "CONTEMPORARY ART GALLERY",
        galleryAddress: "44 MAGYAR ST, DISTRICT V, BUDAPEST",
        exhibitionDate: "OPENING: 15 AUGUST 2025, 18:00",
        chatTitle: "Ask the Curator",
        chatHeader: "Ask the Curator",
        chatPlaceholder: "Ask a question...",
        chatSendTitle: "Send",
        menuAbout: "About Me",
        menuGallery: "Gallery",
        menuCurator: "Curator",
        menuPerformance: "Music, Poetry, Performance",
        aboutTitle: "About the Artist",
        aboutContent: "My work is a mirror held to the duality of existence. In every stroke, I explore the delicate balance between light and shadow, creation and decay, the serene and the chaotic.",
        performanceTitle: "A Glimpse: Music, Poetry, & Performance",
        performanceContent: "'...thus I also speak through the voice of the ear, the mouth, and the eye.' My musical, poetic, and performance works are available on my YouTube channel. Click the button below!",
        performanceYoutubeButton: "Watch on YouTube",
    }
};

type Language = keyof typeof locales;

// --- STATE ---
let currentLang: Language = (localStorage.getItem('exhibition_lang') as Language) || 'en';
let chatHistory: ChatContent[] = []; 
let currentGalleryIndex = 0;
// let ai: GoogleGenAI; // <<< Ezt a sort már nem kell ide

const md = markdownit({
    html: false,
    linkify: true,
    typographer: true,
});

// --- DOM ELEMENTS ---
const dom = {
    soundToggle: document.getElementById('sound-toggle')!,
    videoBackground: document.getElementById('video-background') as HTMLVideoElement,
    langButtons: document.querySelectorAll<HTMLButtonElement>('.lang-selector button'),
    artistName: document.getElementById('artist-name')!,
    exhibitionTitle: document.getElementById('exhibition-title')!,
    artworkContainer: document.getElementById('artwork-container')!,
    detailsContainer: document.getElementById('details-container')!,
    // New Menu
    menuToggle: document.getElementById('menu-toggle')!,
    menuOverlay: document.getElementById('menu-overlay')!,
    menuLinkAbout: document.getElementById('menu-link-about')!,
    menuLinkGallery: document.getElementById('menu-link-gallery')!,
    menuLinkCurator: document.getElementById('menu-link-curator')!,
    menuLinkPerformance: document.getElementById('menu-link-performance')!,
     // About Modal
    aboutModal: document.getElementById('about-modal')!,
    aboutClose: document.getElementById('about-close')!,
    // Performance Modal
    performanceModal: document.getElementById('performance-modal')!,
    performanceClose: document.getElementById('performance-close')!,
    // Chat
    chatContainer: document.getElementById('chat-container')!,
    chatClose: document.getElementById('chat-close')!,
    chatMessages: document.getElementById('chat-messages')!,
    chatInput: document.getElementById('chat-input') as HTMLInputElement,
    chatSend: document.getElementById('chat-send')!,
    // Gallery
    galleryModal: document.getElementById('gallery-modal')!,
    galleryClose: document.getElementById('gallery-close')!,
    galleryImage: document.getElementById('gallery-image') as HTMLImageElement,
    galleryPrev: document.getElementById('gallery-prev')!,
    galleryNext: document.getElementById('gallery-next')!,
    galleryCounter: document.getElementById('gallery-counter')!,
};

// --- UTILITIES ---
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- I18N ---
function setLanguage(lang: Language) {
    currentLang = lang;
    localStorage.setItem('exhibition_lang', lang);

    dom.langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-key]').forEach(el => {
        const key = el.dataset.i18nKey as keyof typeof locales.en;
        if (key && locales[lang][key]) {
            el.textContent = locales[lang][key];
        }
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-key-placeholder]').forEach(el => {
        const key = el.dataset.i18nKeyPlaceholder as keyof typeof locales.en;
        if (key && locales[lang][key]) {
            (el as HTMLInputElement).placeholder = locales[lang][key];
        }
    });
    document.querySelectorAll<HTMLElement>('[data-i18n-key-title]').forEach(el => {
        const key = el.dataset.i18nKeyTitle as keyof typeof locales.en;
        if (key && locales[lang][key]) {
            (el as HTMLButtonElement).title = locales[lang][key];
        }
    });

    document.title = locales[lang].pageTitle;
    
    // Reset chat on language change
    chatHistory = [];
    dom.chatMessages.innerHTML = '';
}

function toggleSound() {
    const video = dom.videoBackground;
    if (!video) return;
    const icon = dom.soundToggle.querySelector('i')!;
    video.muted = !video.muted;
    icon.className = video.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
}

// --- ANIMATION ---
async function startFadingArtworksLoop() {
    let currentIndex = 0;
    while (true) {
        const img = document.createElement('img');
        img.src = ARTWORK_PATHS[currentIndex];
        img.alt = `Artwork ${currentIndex + 1}`;
        dom.artworkContainer.innerHTML = ''; // Clear previous image
        dom.artworkContainer.appendChild(img);
        
        currentIndex = (currentIndex + 1) % TOTAL_ARTWORKS;
        await sleep(10000); // Duration of the fadeInOut animation
    }
}

async function startAnimationSequence() {
    await sleep(1500);
    dom.artistName.classList.remove('hidden');
    dom.artistName.classList.add('animate-fadeInUp');
    await sleep(500);
    dom.exhibitionTitle.classList.remove('hidden');
    dom.exhibitionTitle.classList.add('animate-fadeInUp');

    await sleep(4000);
    dom.artistName.classList.replace('animate-fadeInUp', 'animate-fadeOutUp');
    dom.exhibitionTitle.classList.replace('animate-fadeInUp', 'animate-fadeOutUp');
    
    await sleep(1500);
    dom.detailsContainer.classList.remove('hidden');
    const details = dom.detailsContainer.querySelectorAll('p');
    for (let i = 0; i < details.length; i++) {
        details[i].style.animationDelay = `${i * 0.3}s`;
    }

    await sleep(1000);
    startFadingArtworksLoop();
}

// --- MENU ---
function toggleMenu(forceState?: boolean) {
    const shouldBeOpen = forceState === undefined ? dom.menuOverlay.classList.contains('hidden') : forceState;
    dom.menuOverlay.classList.toggle('hidden', !shouldBeOpen);
    dom.menuToggle.classList.toggle('open', shouldBeOpen);
    const icon = dom.menuToggle.querySelector('i')!;
    icon.className = shouldBeOpen ? 'fas fa-times' : 'fas fa-bars';
}


// --- ABOUT MODAL ---
function openAboutModal() {
    dom.aboutModal.classList.remove('hidden');
    dom.aboutModal.classList.add('modal-base');
    window.addEventListener('keydown', handleAboutKeyPress);
}

function closeAboutModal() {
    dom.aboutModal.classList.add('hidden');
    dom.aboutModal.classList.remove('modal-base');
    window.removeEventListener('keydown', handleAboutKeyPress);
}

function handleAboutKeyPress(e: KeyboardEvent) {
    if (e.key === 'Escape') closeAboutModal();
}

// --- PERFORMANCE MODAL ---
function openPerformanceModal() {
    dom.performanceModal.classList.remove('hidden');
    dom.performanceModal.classList.add('modal-base');
    window.addEventListener('keydown', handlePerformanceKeyPress);
}

function closePerformanceModal() {
    dom.performanceModal.classList.add('hidden');
    dom.performanceModal.classList.remove('modal-base');
    window.removeEventListener('keydown', handlePerformanceKeyPress);
}

function handlePerformanceKeyPress(e: KeyboardEvent) {
    if (e.key === 'Escape') closePerformanceModal();
}

// --- GALLERY ---
function updateGalleryImage() {
    dom.galleryImage.src = ARTWORK_PATHS[currentGalleryIndex];
    dom.galleryCounter.textContent = `${currentGalleryIndex + 1} / ${TOTAL_ARTWORKS}`;
}

function openGallery() {
    updateGalleryImage();
    dom.galleryModal.classList.remove('hidden');
    dom.galleryModal.classList.add('modal-base');
    window.addEventListener('keydown', handleGalleryKeyPress);
}

function closeGallery() {
    dom.galleryModal.classList.add('hidden');
    dom.galleryModal.classList.remove('modal-base');
    window.removeEventListener('keydown', handleGalleryKeyPress);
}

function showNextImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % TOTAL_ARTWORKS;
    updateGalleryImage();
}

function showPrevImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + TOTAL_ARTWORKS) % TOTAL_ARTWORKS;
    updateGalleryImage();
}

function handleGalleryKeyPress(e: KeyboardEvent) {
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
}

// --- CHAT ---
function toggleChat(forceState?: boolean) {
    const isHidden = dom.chatContainer.classList.contains('hidden');
    const shouldBeOpen = forceState === undefined ? isHidden : forceState;
    dom.chatContainer.classList.toggle('hidden', !shouldBeOpen);
    if (shouldBeOpen) dom.chatInput.focus();
}

function addMessageToChat(text: string, sender: 'user' | 'ai') {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message', sender);
    const sanitizedContent = sanitizeHtml(md.render(text));
    setElementInnerHtml(messageEl, sanitizedContent);
    dom.chatMessages.appendChild(messageEl);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
    return messageEl;
}

function addThinkingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('message', 'ai', 'thinking');
    indicator.innerHTML = '<span></span><span></span><span></span>';
    dom.chatMessages.appendChild(indicator);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
    return indicator;
}

async function handleSendMessage() {
    const prompt = dom.chatInput.value.trim();
    if (!prompt) return;

    // A korábbi 'if (!ai)' ellenőrzésre már nincs szükség, mert a backend kezeli az API hívást.
    // De az index.tsx-ben még mindig szerepel az 'ai' változó deklarációja (let ai: GoogleGenAI;).
    // Ezt kell eltávolítani. Az 'ai' változó törlésével ez a blokk is automatikusan megszűnik.
    /*
    if (!ai) {
        addMessageToChat("AI Client not initialized. Please ensure the API Key is set up correctly.", 'ai');
        return;
    }
    */

    dom.chatInput.value = '';
    addMessageToChat(prompt, 'user');
    const thinkingIndicator = addThinkingIndicator();

    const currentHistory = [...chatHistory]; // Másold a történelmet, mielőtt hozzáadod az új üzenetet
    chatHistory.push({ role: 'user', parts: [{ text: prompt }] }); // Add hozzá a felhasználó üzenetét a történelmethez

    try {
        // --- ÚJ FETCH HÍVÁS A BACKENDHEZ ---
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: prompt,
                history: currentHistory, // Küldjük el a teljes előzményt
                lang: currentLang // Küldjük el az aktuális nyelvet a rendszerutasításokhoz
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Szerver Hiba: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.text;
        // --- VÉGE AZ ÚJ FETCH HÍVÁSNAK ---

        thinkingIndicator.remove();

        const responseEl = addMessageToChat('', 'ai');
        const sanitizedResponseHtml = sanitizeHtml(md.render(aiResponse));
        setElementInnerHtml(responseEl, sanitizedResponseHtml);
        dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;

        chatHistory.push({ role: 'model', parts: [{ text: aiResponse }] }); // Add hozzá az AI választ a történelmethez

    } catch (error) {
        thinkingIndicator.remove();
        console.error("Chat Hiba:", error);
        addMessageToChat("Sajnálom, hiba történt. Kérlek próbáld újra később.", 'ai');
        // Ha az API hívás sikertelen, távolítsuk el a felhasználó üzenetét az előzményekből
        chatHistory.pop(); // Eltávolítja a felhasználó üzenetét, ha a kérés meghiúsult
    }
}

// --- INITIALIZATION ---
function init() {
    // A Gemini AI kliens inicializálása már a backendről történik, nem itt.
    // Így az API kulcs nem kerül a böngészőbe.
    // Az alábbi 'try-catch' blokk és az 'ai' változó inicializálása már NEM kell.
    /*
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch(e) {
        console.error("Failed to initialize Gemini AI Client:", e);
        // Disable chat functionality if the client fails to initialize.
        dom.menuLinkCurator.style.display = 'none';
    }
    */
    
    // UI Listeners
    dom.soundToggle.addEventListener('click', toggleSound);
    dom.langButtons.forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang as Language));
    });

    // Menu Listeners
    dom.menuToggle.addEventListener('click', () => toggleMenu());
    dom.menuLinkAbout.addEventListener('click', (e) => {
        e.preventDefault();
        openAboutModal();
        toggleMenu(false);
    });
    dom.menuLinkGallery.addEventListener('click', (e) => {
        e.preventDefault();
        openGallery();
        toggleMenu(false);
    });
    dom.menuLinkCurator.addEventListener('click', (e) => {
        e.preventDefault();
        toggleChat(true);
        toggleMenu(false);
    });
    dom.menuLinkPerformance.addEventListener('click', (e) => {
        e.preventDefault();
        openPerformanceModal();
        toggleMenu(false);
    });
    
    // About Modal Listeners
    dom.aboutClose.addEventListener('click', closeAboutModal);

    // Performance Modal Listeners
    dom.performanceClose.addEventListener('click', closePerformanceModal);


    // Chat Listeners
    dom.chatClose.addEventListener('click', () => toggleChat(false));
    dom.chatSend.addEventListener('click', handleSendMessage);
    dom.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    // Gallery Listeners
    dom.galleryClose.addEventListener('click', closeGallery);
    dom.galleryNext.addEventListener('click', showNextImage);
    dom.galleryPrev.addEventListener('click', showPrevImage);

    setLanguage(currentLang);
    startAnimationSequence();
}

// --- RUN ---
init();
export {};
