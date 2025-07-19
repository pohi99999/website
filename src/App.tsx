<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import markdownit from 'markdown-it';
import { sanitizeHtml } from 'safevalues';
import { setElementInnerHtml } from 'safevalues/dom';
=======
import { useState, useEffect, useRef } from 'react';
import markdownit from 'markdown-it';
>>>>>>> d6a25703342fbe40c9b7c1e458bf76a620cb4da4
import ReactPlayer from 'react-player/youtube';

// --- TÍPUSOK ---
type ChatContent = {
    role: 'user' | 'model';
    parts: { text: string }[];
};
type Language = 'hu' | 'en';

// --- KONFIGURÁCIÓ ---
const TOTAL_ARTWORKS = 10;
const ARTWORK_PATHS = Array.from({ length: TOTAL_ARTWORKS }, (_, i) => `/${i + 1}.jpeg`);

const locales = {
    hu: {
        pageTitle: "Giada Fervere | A Láthatatlan Visszhangjai",
        artistName: "Giada Fervere",
        exhibitionTitle: "A Láthatatlan Visszhangjai",
        galleryName: "KORTÁRS KÉPZŐMŰVÉSZETI GALÉRIA",
        galleryAddress: "V. BUDAPEST, MAGYAR U. 44.",
        exhibitionDate: "MEGNYITÓ: 2025. 08. 15. 18:00",
        mapButton: "Térkép",
        mapTitle: "Helyszín a térképen",
        chatTitle: "Kérdezz a kurátortól",
        chatHeader: "Kérdezd a kurátort",
        chatPlaceholder: "Tegyél fel egy kérdést...",
        chatSendTitle: "Küldés",
        menuAbout: "Rólam",
        menuGallery: "Galéria",
        menuCurator: "Kurátor",
        menuPerformance: "Zene, Vers, Előadás",
        menuBlog: "Blog",
        aboutTitle: "A Művészről",
        aboutContent: "Munkásságom egy tükör, melyet a létezés kettősségének tartok. Minden ecsetvonással a fény és az árnyék, a teremtés és az enyészet, a nyugodt és a kaotikus közötti kényes egyensúlyt kutatom. Nem célom, hogy válaszokat adjak, hanem hogy visszatükrözzem azokat a kérdéseket, amelyek mindannyiunkban mélyen ott lakoznak. Művészetemen keresztül párbeszédre hívlak a láthatatlannal, hogy meghalljuk a magunkban hordozott csendes igazságok visszhangját. Minden egyes alkotás egy utazás, egy töredék az egyetemes történetből, mely a színek és formák nyelvén íródott.",
        performanceTitle: "Betekintés: Zene, Vers és Előadás",
        performanceContent: "„…így szólok még a fül, a száj és a szem hangján.” A YouTube csatornámon megtekinthetőek a zenei, költészeti és előadói munkáim. Kattintson az alábbi gombra!",
        performanceYoutubeButton: "Megtekintés a YouTube-on",
        blogTitle: "Blog bejegyzéseim, gondolataim",
        blogContent: "Frissítés alatt...",
        sponsors: "Fő támogatók: Pohánka És Társa Company & Classica-2 Kft.",
        copyright: "© 2025 Giada Fervere Produkció. Minden jog fenntartva.",
<<<<<<< HEAD
    }, // <-- EZ A VESSZŐ HIÁNYZOTT VALÓSZÍNŰLEG!
=======
    },
>>>>>>> d6a25703342fbe40c9b7c1e458bf76a620cb4da4
    en: {
        pageTitle: "Giada Fervere | Echoes of the Unseen",
        artistName: "Giada Fervere",
        exhibitionTitle: "Echoes of the Unseen",
        galleryName: "CONTEMPORARY ART GALLERY",
        galleryAddress: "44 MAGYAR ST, DISTRICT V, BUDAPEST",
        exhibitionDate: "OPENING: 15 AUGUST 2025, 18:00",
        mapButton: "Map",
        mapTitle: "Location on Map",
        chatTitle: "Ask the Curator",
        chatHeader: "Ask the Curator",
        chatPlaceholder: "Ask a question...",
        chatSendTitle: "Send",
        menuAbout: "About Me",
        menuGallery: "Gallery",
        menuCurator: "Curator",
        menuPerformance: "Music, Poetry, & Performance",
        menuBlog: "Blog",
        aboutTitle: "About the Artist",
        aboutContent: "My work is a mirror I hold up to the duality of existence. With every brushstroke, I explore the delicate balance between light and shadow, creation and decay, the serene and the chaotic. My goal is not to provide answers, but to reflect the questions that lie deep within us all. Through my art, I invite you to a dialogue with the unseen, to hear the echoes of the silent truths we carry within ourselves. Each creation is a journey, a fragment of the universal story, written in the language of colors and forms.",
        performanceTitle: "A Glimpse: Music, Poetry, & Performance",
        performanceContent: "'...thus I also speak through the voice of the ear, the mouth, and the eye.' My musical, poetic, and performance works are available on my YouTube channel. Click the button below!",
        performanceYoutubeButton: "Watch on YouTube",
        blogTitle: "My Blog Posts, My Thoughts",
        blogContent: "Under construction...",
        sponsors: "Main Sponsors: Pohánka És Társa Company & Classica-2 Kft.",
        copyright: "© 2025 Giada Fervere Production. All rights reserved.",
    }
};

const md = markdownit({
    html: false,
    linkify: true,
    typographer: true,
});


function App() {
    const [currentLang, setCurrentLang] = useState<Language>((localStorage.getItem('exhibition_lang') as Language) || 'en');
    const [chatHistory, setChatHistory] = useState<ChatContent[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isChatOpen, setChatOpen] = useState(false);
    const [isGalleryOpen, setGalleryOpen] = useState(false);
    const [isAboutOpen, setAboutOpen] = useState(false);
    const [isPerformanceOpen, setPerformanceOpen] = useState(false);
    const [isBlogOpen, setBlogOpen] = useState(false);
    const [isMapOpen, setMapOpen] = useState(false);

    const chatMessagesRef = useRef<HTMLDivElement>(null);

    const setLanguage = (lang: Language) => {
        setCurrentLang(lang);
        localStorage.setItem('exhibition_lang', lang);
        setChatHistory([]);
    };

    useEffect(() => {
        document.title = locales[currentLang].pageTitle;
    }, [currentLang]);

    const handleSendMessage = async () => {
        const prompt = chatInput.trim();
        if (!prompt || isChatting) return;

        setIsChatting(true);
        const userMessage: ChatContent = { role: 'user', parts: [{ text: prompt }] };
        const newHistory = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setChatInput('');

        try {
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: prompt,
                    history: chatHistory,
                    lang: currentLang
                })
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.statusText}`);
            }

            const data = await response.json();
            const aiResponse: ChatContent = { role: 'model', parts: [{ text: data.text }] };
            setChatHistory([...newHistory, aiResponse]);

        } catch (error) {
            console.error("Chat Hiba:", error);
            const errorResponse: ChatContent = { role: 'model', parts: [{ text: "Sajnálom, hiba történt. Kérlek próbáld újra később." }] };
            setChatHistory([...newHistory, errorResponse]);
        } finally {
            setIsChatting(false);
        }
    };
    
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatHistory]);


    const showNextImage = () => setCurrentGalleryIndex((prev) => (prev + 1) % TOTAL_ARTWORKS);
    const showPrevImage = () => setCurrentGalleryIndex((prev) => (prev - 1 + TOTAL_ARTWORKS) % TOTAL_ARTWORKS);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (isGalleryOpen && e.key === 'Escape') setGalleryOpen(false);
            if (isAboutOpen && e.key === 'Escape') setAboutOpen(false);
            if (isPerformanceOpen && e.key === 'Escape') setPerformanceOpen(false);
            if (isBlogOpen && e.key === 'Escape') setBlogOpen(false);
            if (isMapOpen && e.key === 'Escape') setMapOpen(false);
            
            if (isGalleryOpen) {
                if (e.key === 'ArrowRight') showNextImage();
                if (e.key === 'ArrowLeft') showPrevImage();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isGalleryOpen, isAboutOpen, isPerformanceOpen, isBlogOpen, isMapOpen]);


    return (
        <>
            <div id="video-background-wrapper">
                <ReactPlayer
                    url="https://www.youtube.com/watch?v=TK-K1CZsLmU"
                    className="react-player"
                    playing={true}
                    loop={true}
                    muted={true}
                    controls={false}
                    width="100%"
                    height="100%"
                />
            </div>
            <div id="video-overlay"></div>

            <header className="ui-controls">
                <div className="top-left">
                    <button onClick={() => setMenuOpen(!isMenuOpen)} title="Menu">
                        <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
                    </button>
                </div>
                <div className="top-right">
                    <div className="lang-selector">
                        <button onClick={() => setLanguage('hu')} className={currentLang === 'hu' ? 'active' : ''}>HU</button>
                        <span>|</span>
                        <button onClick={() => setLanguage('en')} className={currentLang === 'en' ? 'active' : ''}>EN</button>
                    </div>
                </div>
            </header>

            <main id="content-wrapper">
                <div id="intro-sequence">
                    <h2 id="artist-name">{locales[currentLang].artistName}</h2>
                    <h1 id="exhibition-title">{locales[currentLang].exhibitionTitle}</h1>
                </div>
                <div id="details-container">
                    <p>{locales[currentLang].galleryName}</p>
                    <p>{locales[currentLang].galleryAddress}</p>
                    <p>{locales[currentLang].exhibitionDate}</p>
                    <button id="map-btn" onClick={() => setMapOpen(true)}>
                        <i className="fas fa-map-marker-alt"></i>
                        {locales[currentLang].mapButton}
                    </button>
                </div>
            </main>

            {/* Menü */}
            <div id="menu-overlay" className={!isMenuOpen ? 'hidden' : ''}>
                <nav>
                    <a href="#" onClick={() => { setAboutOpen(true); setMenuOpen(false); }}>{locales[currentLang].menuAbout}</a>
                    <a href="#" onClick={() => { setGalleryOpen(true); setMenuOpen(false); }}>{locales[currentLang].menuGallery}</a>
                    <a href="#" onClick={() => { setChatOpen(true); setMenuOpen(false); }}>{locales[currentLang].menuCurator}</a>
                    <a href="#" onClick={() => { setPerformanceOpen(true); setMenuOpen(false); }}>{locales[currentLang].menuPerformance}</a>
                    <a href="#" onClick={() => { setBlogOpen(true); setMenuOpen(false); }}>{locales[currentLang].menuBlog}</a>
                </nav>
            </div>

            {/* Modálok */}
            <div id="about-modal" className={`modal-base ${!isAboutOpen ? 'hidden' : ''}`}>
                <div id="about-content">
                    <button onClick={() => setAboutOpen(false)} className="modal-close-btn" title="Close"><i className="fas fa-times"></i></button>
                    <h2>{locales[currentLang].aboutTitle}</h2>
                    <p>{locales[currentLang].aboutContent}</p>
                </div>
            </div>
            
            <div id="performance-modal" className={`modal-base ${!isPerformanceOpen ? 'hidden' : ''}`}>
                <div id="performance-content">
                    <button onClick={() => setPerformanceOpen(false)} className="modal-close-btn" title="Close"><i className="fas fa-times"></i></button>
                    <h2>{locales[currentLang].performanceTitle}</h2>
                    <p>{locales[currentLang].performanceContent}</p>
                     <a href="https://youtube.com/@giadafervere?si=XQYtCwJdn8K_5OZh" target="_blank" rel="noopener noreferrer" className="youtube-btn">
                        <i className="fab fa-youtube"></i>
                        <span>{locales[currentLang].performanceYoutubeButton}</span>
                    </a>
                </div>
            </div>

            <div id="blog-modal" className={`modal-base ${!isBlogOpen ? 'hidden' : ''}`}>
                <div id="blog-content">
                    <button onClick={() => setBlogOpen(false)} className="modal-close-btn" title="Close"><i className="fas fa-times"></i></button>
                    <h2>{locales[currentLang].blogTitle}</h2>
                    <p>{locales[currentLang].blogContent}</p>
                </div>
            </div>

            <div id="map-modal" className={`modal-base ${!isMapOpen ? 'hidden' : ''}`}>
                <div id="map-content">
                    <button onClick={() => setMapOpen(false)} className="modal-close-btn" title="Close"><i className="fas fa-times"></i></button>
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2695.882581898862!2d19.05389641562694!3d47.49355197917737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741dce4f823a63d%3A0x4de5c24f54e6f34!2sBudapest%2C%20Magyar%20u.%2044%2C%201053!5e0!3m2!1shu!2shu!4v1689819400000"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>
            </div>

            <div id="chat-container" className={!isChatOpen ? 'hidden' : ''}>
                <div id="chat-header">
                    <h3>{locales[currentLang].chatHeader}</h3>
                    <button onClick={() => setChatOpen(false)} title="Close"><i className="fas fa-times"></i></button>
                </div>
                <div ref={chatMessagesRef} id="chat-messages">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}
                             dangerouslySetInnerHTML={{ __html: md.render(msg.parts[0].text) }} />
                    ))}
                    {isChatting && (
                        <div className="message ai thinking">
                            <span></span><span></span><span></span>
                        </div>
                    )}
                </div>
                <div id="chat-input-container">
                    <input
                        type="text"
                        id="chat-input"
                        placeholder={locales[currentLang].chatPlaceholder}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isChatting}
                    />
                    <button id="chat-send" onClick={handleSendMessage} disabled={isChatting} title={locales[currentLang].chatSendTitle}>
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>

            <div id="gallery-modal" className={`modal-base ${!isGalleryOpen ? 'hidden' : ''}`}>
                <button onClick={() => setGalleryOpen(false)} className="gallery-control close" title="Close"><i className="fas fa-times"></i></button>
                <button onClick={showPrevImage} className="gallery-control prev" title="Previous"><i className="fas fa-chevron-left"></i></button>
                <button onClick={showNextImage} className="gallery-control next" title="Next"><i className="fas fa-chevron-right"></i></button>
                <div id="gallery-content">
                    <img id="gallery-image" src={ARTWORK_PATHS[currentGalleryIndex]} alt="Artwork" />
                    <div id="gallery-counter">{`${currentGalleryIndex + 1} / ${TOTAL_ARTWORKS}`}</div>
                </div>
            </div>

            <footer className="social-links">
                <a href="https://www.facebook.com/profile.php?id=100070613388519" target="_blank" rel="noopener noreferrer" title="Facebook">
                    <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://www.instagram.com/giadafervere" target="_blank" rel="noopener noreferrer" title="Instagram">
                    <i className="fab fa-instagram"></i>
                </a>
                <a href="mailto:giadafervere269@gmail.com" title="Email">
                    <i className="fas fa-envelope"></i>
                </a>
            </footer>

            <footer className="main-footer">
                <p className="sponsors">{locales[currentLang].sponsors}</p>
                <p className="copyright">{locales[currentLang].copyright}</p>
            </footer>
        </>
    );
}

export default App;
