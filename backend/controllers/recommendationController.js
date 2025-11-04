import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getRecommendations = async (req, res) => {
    const { climate, soilType, cropType, cropInfo, weatherDetails, cropConditions } = req.body;

    const promptText = `
        You are an agronomy expert offering practical advice to farmers.
        Use the following context to craft clear, actionable guidance:
        1. Climate: ${climate || 'N/A'}
        2. Soil Type: ${soilType || 'N/A'}
        3. Crop Type: ${cropType || 'N/A'}
        4. Crop Information: ${cropInfo || 'N/A'}
        5. Today's Weather: ${weatherDetails || 'N/A'}
        6. Crop Conditions: ${cropConditions || 'N/A'}

        Provide:
        - A prioritized list of tasks for today.
        - Crop care tips tailored to the conditions.
        - Precautions or warnings farmers should heed.
        Keep the tone supportive and easy to follow.
    `;

    try {
        const response = await openai.responses.create({
            model: 'gpt-4o-mini',
            input: promptText.trim(),
            temperature: 0.65,
        });

        const recommendation = response.output_text?.trim();

        if (!recommendation) {
            console.error('OpenAI response did not include text output.', response);
            return res.status(502).json({ error: 'No recommendations returned' });
        }

        res.status(200).json({ recommendation });
    } catch (err) {
        console.error('Error fetching recommendations: ', err);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
};
