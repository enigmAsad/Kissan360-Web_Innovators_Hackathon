import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;
const FALLBACK_ALERTS = 'Update not available\nCheck local advisories';

export const getFarmingAlerts = async (req, res) => {
    const { region } = req.query;

    const promptText = `
        Provide up to 2 concise farming alerts (max 6 words each).
        Focus on immediate weather or agronomy actions farmers in ${region || 'the specified region'} should take today.
        Keep the language direct, actionable, and farmer-friendly.
    `;

    if (!openai) {
        console.warn('OpenAI API key missing; returning fallback alerts');
        return res.status(200).json({ alerts: FALLBACK_ALERTS, warning: 'Using fallback alerts' });
    }

    try {
        const response = await openai.responses.create({
            model: 'gpt-4o-mini',
            input: promptText.trim(),
            temperature: 0.7,
        });

        const alerts = response.output_text?.trim();

        if (!alerts) {
            console.error('OpenAI response did not include text output.', response);
            return res.status(200).json({ alerts: FALLBACK_ALERTS, warning: 'No alerts returned' });
        }

        res.status(200).json({ alerts });
    } catch (err) {
        console.error('Error fetching farming alerts: ', err);
        res.status(200).json({ alerts: FALLBACK_ALERTS, warning: 'Failed to fetch alerts' });
    }
};
