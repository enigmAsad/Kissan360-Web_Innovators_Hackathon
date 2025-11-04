import express from 'express';
import { getPakistanWeather } from '../controllers/weatherController.js';

const router = express.Router();

router.get('/', getPakistanWeather);

export default router;

