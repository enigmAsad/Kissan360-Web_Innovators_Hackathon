import express from 'express';
import { 
    createItem, 
    updateItem, 
    deleteItem, 
    createPrice,
    getItems,
    getItemTrend,
    compareItems,
    getPricesSummary,
    getCities,
    getItemPrices,
    deleteItemCityPrices
} from '../controllers/marketController.js';
import { verifyToken } from '../middleware/jwt.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// Public routes
router.get('/items', getItems);
router.get('/items/:id/trend', getItemTrend);
router.get('/compare', compareItems);
router.get('/cities', getCities);
router.get('/prices/item/:itemId', getItemPrices);

// Admin-only routes
router.post('/items', verifyToken, requireAdmin, createItem);
router.patch('/items/:id', verifyToken, requireAdmin, updateItem);
router.delete('/items/:id', verifyToken, requireAdmin, deleteItem);
router.post('/prices', verifyToken, requireAdmin, createPrice);
router.delete('/prices/item/:itemId/city/:city', verifyToken, requireAdmin, deleteItemCityPrices);
router.get('/prices/summary', verifyToken, requireAdmin, getPricesSummary);

export default router;
