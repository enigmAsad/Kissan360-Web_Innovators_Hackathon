import express from 'express';
import multer from 'multer';

import { proxyVoiceInteraction } from '../controllers/voiceAssistantController.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: Number(process.env.MAX_VOICE_UPLOAD_BYTES || 5 * 1024 * 1024),
    },
});

router.post('/interact', upload.single('audio'), proxyVoiceInteraction);

export default router;


