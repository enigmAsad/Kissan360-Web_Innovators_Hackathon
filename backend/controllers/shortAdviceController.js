import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getShortAdvice = async (req, res) => {
    const { cropType, location, upcomingWeather, marketOutlook, urgentIssue } = req.body;

    const promptText = `
        You are an agronomy assistant generating quick actionable alerts for farmers.
        Use the provided context to craft concise advice (max 90 characters each).
        Only include items that are directly supported by the inputs.

        Inputs:
        - Crop: ${cropType || 'unknown crop'}
        - Location: ${location || 'unknown location'}
        - Upcoming weather: ${upcomingWeather || 'not provided'}
        - Market outlook: ${marketOutlook || 'not provided'}
        - Urgent issue: ${urgentIssue || 'none'}

        Respond strictly as JSON with the following shape:
        {
            "advices": ["short tip 1", "short tip 2", "short tip 3"]
        }

        Provide two or three items when relevant, otherwise return an empty array.
    `;

    try {
        const response = await openai.responses.create({
            model: 'gpt-4o-mini',
            input: promptText.trim(),
            temperature: 0.4,
        });

        const rawOutput = response.output_text?.trim();

        if (!rawOutput) {
            console.error('OpenAI short advice response missing text.', response);
            return res.status(502).json({ error: 'No advice returned' });
        }

        let advices = [];

        try {
            const parsed = JSON.parse(rawOutput);
            if (Array.isArray(parsed.advices)) {
                advices = parsed.advices
                    .map((item) => (typeof item === 'string' ? item.trim() : ''))
                    .filter(Boolean);
            }
        } catch (jsonError) {
            console.warn('Failed to parse short advice JSON. Falling back to newline split.', jsonError);
            advices = rawOutput
                .split('\n')
                .map((item) => item.replace(/^[-•]\s*/, '').trim())
                .filter(Boolean)
                .slice(0, 3);
        }

        if (advices.length === 0) {
            console.error('Short advice generation returned no actionable items.', rawOutput);
            return res.status(502).json({ error: 'Advice unavailable' });
        }

        res.status(200).json({ advices });
    } catch (err) {
        console.error('Error fetching short advice: ', err);
        res.status(500).json({ error: 'Failed to fetch short advice' });
    }
};


