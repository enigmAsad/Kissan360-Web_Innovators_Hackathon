import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getFarmingAlerts = async (req, res) => {
    const { region } = req.query;

    const promptText = `
        Provide up to 2 concise farming alerts (max 6 words each).
        Focus on immediate weather or agronomy actions farmers in ${region || 'the specified region'} should take today.
        Keep the language direct, actionable, and farmer-friendly.
    `;

    try {
        const response = await openai.responses.create({
            model: 'gpt-4o-mini',
            input: promptText.trim(),
            temperature: 0.7,
        });

        const alerts = response.output_text?.trim();

        if (!alerts) {
            console.error('OpenAI response did not include text output.', response);
            return res.status(502).json({ error: 'No alerts returned' });
        }

        res.status(200).json({ alerts });
    } catch (err) {
        console.error('Error fetching farming alerts: ', err);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
};
