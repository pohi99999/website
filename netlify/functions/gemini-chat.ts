import { Handler, HandlerEvent } from '@netlify/functions';
// --- ITT A JAVÍTÁS: a '@google/genai' helyett a helyes '@google/generative-ai' ---
import { GoogleGenerativeAI, type Content } from '@google/generative-ai';

// A rendszerutasításokat itt definiáljuk
const chatSystemInstructions = {
    hu: "Te vagy a virtuális kurátor Giada Fervere 'A Láthatatlan Visszhangjai' című kiállításán. A helyszín: KORTÁRS KÉPZŐMŰVÉSZETI GALÉRIA, V. BUDAPEST, MAGYAR U. 44. A megnyitó 2025. augusztus 15-én 18:00-kor lesz. A személyiséged műértő, lelkes és segítőkész. Adj rövid, de informatív és inspiráló válaszokat a kiállítással, a művésszel, az új helyszínnel és dátummal, vagy az absztrakt művészettel kapcsolatos kérdésekre. Használj magyar nyelvet.",
    en: "You are the virtual curator for Giada Fervere's exhibition, 'Echoes of the Unseen'. The venue is: CONTEMPORARY ART GALLERY, 44 MAGYAR ST, DISTRICT V, BUDAPEST. The opening is at 18:00 on August 15, 2025. Your persona is knowledgeable, enthusiastic, and helpful. Provide concise, yet informative and inspiring answers to questions about the exhibition, the artist, the new venue and date, or abstract art in general. Use English language."
};

const handler: Handler = async (event: HandlerEvent) => {
    // Csak a POST kéréseket fogadjuk el
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Az API kulcsot a Netlify környezeti változóiból olvassuk ki
    const API_KEY = process.env.VITE_GEMINI_API_KEY;

    if (!API_KEY) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: 'API key is not configured on the server.' }) 
        };
    }

    try {
        // A kérés törzséből kiolvassuk az adatokat
        const { message, history, lang } = JSON.parse(event.body || '{}');

        if (!message) {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ error: 'Message is required.' }) 
            };
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const systemInstructionContent: Content = {
            role: "system",
            parts: [{ text: chatSystemInstructions[lang as 'hu' | 'en'] || chatSystemInstructions.en }]
        };

        const chat = model.startChat({
            history: history || [],
            generationConfig: { maxOutputTokens: 500 },
            systemInstruction: systemInstructionContent
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        // Sikeres válasz küldése
        return {
            statusCode: 200,
            body: JSON.stringify({ text }),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred while processing the chat request.' })
        };
    }
};

export { handler };
