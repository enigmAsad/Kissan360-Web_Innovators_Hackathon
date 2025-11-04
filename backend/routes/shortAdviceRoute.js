import express from 'express';
import { getShortAdvice } from '../controllers/shortAdviceController.js';
import { verifyToken } from '../middleware/jwt.js';

const router = express.Router();

router.get('/', getShortAdvice);

export default router;


