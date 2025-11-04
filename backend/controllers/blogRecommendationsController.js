import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getBlogRecommendations = async (req, res) => {
    const { region } = req.query;

    const promptText = `
        Generate fresh blog topic ideas for agricultural experts.
        Provide 2 concise topics (each 5-6 words) that help farmers navigate current issues.
        Focus on weather, crop health, and economic challenges relevant to ${region || 'the target region'}.
        Keep the suggestions expert-friendly and actionable.
    `;

    try {
        const response = await openai.responses.create({
            model: 'gpt-4o-mini',
            input: promptText.trim(),
            temperature: 0.8,
        });

        const recommendations = response.output_text?.trim();

        if (!recommendations) {
            console.error('OpenAI response did not include text output.', response);
            return res.status(502).json({ error: 'No recommendations returned' });
        }

        res.status(200).json({ recommendations });
    } catch (err) {
        console.error('Error fetching expert recommendations: ', err);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
};
