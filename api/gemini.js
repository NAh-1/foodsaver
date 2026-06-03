// api/gemini.js

export default async function handler(req, res) {
    // CORS Headers
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

    // You can keep the environment variable named GEMINI_API_KEY in Vercel,
    // but paste your provider key (e.g., OpenRouter or DeepInfra key) into it!
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key is missing on the server.' });
    }

    try {
        // Extract the original prompt text sent by the frontend
        const frontendPrompt = req.body.contents[0].parts[0].text;

        // Route to an optimized Gemma API endpoint (OpenRouter example)
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "google/gemma-2-27b-it", // Accessing the high-performance instruction-tuned Gemma model
                messages: [
                    { role: "user", content: frontendPrompt }
                ],
                response_format: { type: "json_object" } // Keeps your JSON layout perfect
            })
        });

        const openRouterData = await response.json();
        
        // Format the response back into the structure your frontend index.html expects
        const gemmaTextResponse = openRouterData.choices[0].message.content;
        
        const structuredResponse = {
            candidates: [{
                content: {
                    parts: [{ text: gemmaTextResponse }]
                }
            }]
        };

        res.status(200).json(structuredResponse);
    } catch (error) {
        console.error("Gemma Backend Error:", error);
        res.status(500).json({ error: 'Failed to communicate with Gemma AI server.' });
    }
}