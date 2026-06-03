// api/gemini.js
export default async function handler(req, res) {
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
        return res.status(500).json({ error: 'API key is missing on the server.' });
    }

    // UPDATED: Using the stable production endpoint for gemini-2.5-flash
   // Inside your api/gemini.js file, change the URL back to the stable line:
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        // Error trapping: If Google returns an error object, log it so you can see it in Vercel
        if (data.error) {
            console.error("Google API Error Details:", data.error);
            return res.status(response.status).json(data);
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("Backend Proxy Error:", error);
        res.status(500).json({ error: 'Failed to communicate with AI server.' });
    }
}