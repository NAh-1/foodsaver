// api/gemini.js

export default async function handler(req, res) {
    // Standard Vercel CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
        return res.status(500).json({ error: 'Server API key configuration is missing.' });
    }

    try {
        // Pull the text prompt out of the format your index.html sent
        const frontendPrompt = req.body.contents[0].parts[0].text;

        // Route directly to Google's Gemma 4 31B via OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "google/gemma-4-31b-it:free", // Utilizing Gemma 4 31B IT
                messages: [
                    { role: "user", content: frontendPrompt }
                ]
            })
        });

        const openRouterData = await response.json();
        
        if (openRouterData.error) {
            console.error("OpenRouter Error Details:", openRouterData.error);
            return res.status(500).json({ error: openRouterData.error.message });
        }

        const gemmaTextResponse = openRouterData.choices[0].message.content;
        
        // Re-package the data to exactly mimic the Gemini structure your frontend expects
        const structuredResponse = {
            candidates: [{
                content: {
                    parts: [{ text: gemmaTextResponse }]
                }
            }]
        };

        res.status(200).json(structuredResponse);
    } catch (error) {
        console.error("Gemma 4 Proxy Backend Error:", error);
        res.status(500).json({ error: 'Failed to communicate with Gemma 4 server.' });
    }
}