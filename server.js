// server.js
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-genai'; // Megtartva a pontos package nevet
import path from 'path';
import { fileURLToPath } from 'url';

// A __dirname és __filename imitálása ES modulokhoz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080; // Cloud Run alapértelmezett portja 8080

// JSON body-k parse-olása
app.use(express.json());

// Statikus fájlok kiszolgálása a gyökérkönyvtárból
// Ez fogja kiszolgálni az index.html, index.css, index.tsx, képek, videók fájlokat
app.use(express.static(path.join(__dirname)));

// Gemini API kulcs környezeti változóból
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error('Hiba: Az API_KEY környezeti változó nincs beállítva!');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// System instructions for the chat model
const chatSystemInstructions = {
    hu: "Te vagy a virtuális kurátor Giada Fervere 'A Láthatatlan Visszhangjai' című kiállításán. A helyszín: KORTÁRS KÉPZŐMŰVÉSZETI GALÉRIA, V. BUDAPEST, MAGYAR U. 44. A megnyitó 2025. augusztus 15-én 18:00-kor lesz. A személyiséged műértő, lelkes és segítőkész. Adj rövid, de informatív és inspiráló válaszokat a kiállítással, a művésszel, az új helyszínnel és dátummal, vagy az absztrakt művészettel kapcsolatos kérdésekre. Használj magyar nyelvet.",
    en: "You are the virtual curator for Giada Fervere's exhibition, 'Echoes of the Unseen'. The venue is: CONTEMPORARY ART GALLERY, 44 MAGYAR ST, DISTRICT V, BUDAPEST. The opening is at 18:00 on August 15, 2025. Your persona is knowledgeable, enthusiastic, and helpful. Provide concise, yet informative and inspiring answers to questions about the exhibition, the artist, the new venue and date, or abstract art in general. Use English language."
};


// Chat végpont
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history, lang } = req.body; // Fogadjuk a history-t és a nyelvet is
        if (!message) {
            return res.status(400).json({ error: 'Üzenet hiányzik' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Modell igazítása a frontendhez
        const chat = model.startChat({
            history: history || [], // Használjuk a frontendről kapott előzményeket
            generationConfig: {
                maxOutputTokens: 500,
            },
            // Itt adhatjuk hozzá a rendszerutasításokat, a nyelvtől függően
            systemInstruction: chatSystemInstructions[lang] || chatSystemInstructions.en
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error('Hiba a Gemini API hívásakor:', error);
        res.status(500).json({ error: 'Hiba történt a chat feldolgozása során.' });
    }
});

// Szerver indítása
app.listen(port, () => {
    console.log(`Szerver fut a http://localhost:${port} címen`);
    console.log(`Statikus fájlok kiszolgálása innen: ${__dirname}`);
});