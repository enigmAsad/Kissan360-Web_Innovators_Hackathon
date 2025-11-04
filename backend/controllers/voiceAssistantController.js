import axios from 'axios';
import FormData from 'form-data';

const VOICE_SERVICE_URL = (process.env.VOICE_SERVICE_URL || 'http://localhost:8001').replace(/\/$/, '');
const VOICE_SERVICE_TIMEOUT_MS = Number(process.env.VOICE_SERVICE_TIMEOUT_MS || 1200000);

const buildFormData = (file, body) => {
    const formData = new FormData();

    if (file) {
        formData.append('audio', file.buffer, {
            filename: file.originalname || 'query.wav',
            contentType: file.mimetype || 'audio/wav',
        });
        return formData;
    }

    const base64 = body?.audioBase64 || body?.audio_base64;
    if (typeof base64 === 'string' && base64.trim()) {
        const clean = base64.includes(',') ? base64.split(',').pop() : base64;
        const buffer = Buffer.from(clean, 'base64');

        formData.append('audio', buffer, {
            filename: body?.filename || 'query.wav',
            contentType: body?.mimeType || body?.mime_type || 'audio/wav',
        });
        return formData;
    }

    return null;
};

export const proxyVoiceInteraction = async (req, res) => {
    try {
        const formData = buildFormData(req.file, req.body);

        if (!formData) {
            return res.status(400).json({ error: 'Audio payload missing. Provide multipart audio file or base64 string.' });
        }

        const params = {};
        const language = req.query?.language || req.body?.language;
        if (language) {
            params.language = language;
        }

        const endpoint = `${VOICE_SERVICE_URL}/v1/voice-interact`;

        const response = await axios.post(endpoint, formData, {
            params,
            headers: {
                ...formData.getHeaders(),
            },
            timeout: VOICE_SERVICE_TIMEOUT_MS,
        });

        return res.status(response.status || 200).json(response.data);
    } catch (error) {
        const status = error.response?.status || 502;
        const payload = error.response?.data || { error: 'Voice assistant unavailable' };

        console.error('Voice assistant proxy failed:', error.message || error);

        return res.status(status).json({
            error: payload.error || 'Voice assistant error',
            details: payload,
        });
    }
};


