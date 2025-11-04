import express from 'express';
import { 
    createItem, 
    updateItem, 
    deleteItem, 
    createPrice,
    getItems,
    getItemTrend,
    compareItems,
    getPricesSummary
} from '../controllers/marketController.js';
import { verifyToken } from '../middleware/jwt.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// Public routes
router.get('/items', getItems);
router.get('/items/:id/trend', getItemTrend);
router.get('/compare', compareItems);

// Admin-only routes
router.post('/items', verifyToken, requireAdmin, createItem);
router.patch('/items/:id', verifyToken, requireAdmin, updateItem);
router.delete('/items/:id', verifyToken, requireAdmin, deleteItem);
router.post('/prices', verifyToken, requireAdmin, createPrice);
router.get('/prices/summary', verifyToken, requireAdmin, getPricesSummary);

export default router;
