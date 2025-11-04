import express from 'express';
import { getShortAdvice } from '../controllers/shortAdviceController.js';
import { verifyToken } from '../middleware/jwt.js';

const router = express.Router();

router.post('/', verifyToken, getShortAdvice);

export default router;


