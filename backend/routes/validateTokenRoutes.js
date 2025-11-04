import express from 'express';
import { verifyToken } from '../middleware/jwt.js';

const router = express.Router();

router.get('/validate-token', verifyToken, (req, res) => {
  res.json({ userId: req.userId, role: req.userRole });
});

export default router;

