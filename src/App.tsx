// ... a fájl többi része változatlan ...

    const handleSendMessage = async () => {
        const prompt = chatInput.trim();
        if (!prompt || isChatting) return;

        setIsChatting(true);
        const userMessage: ChatContent = { role: 'user', parts: [{ text: prompt }] };
        const newHistory = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setChatInput('');

        try {
            // --- ITT A VÁLTOZÁS ---
            // Most már a Netlify function URL-jét hívjuk
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
                // ... a hibakezelés többi része változatlan ...
            }

            // ... a többi rész változatlan ...

// ... a fájl többi része változatlan ...
