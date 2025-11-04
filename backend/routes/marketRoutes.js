import express from 'express'
import { verifyToken } from '../middleware/jwt.js'
import { requireAdmin } from '../middleware/roles.js'
import { createItem, updateItem, disableItem, listItems, upsertPrice, getTrend, compareItems, priceSummary } from '../controllers/marketController.js'

const router = express.Router()

// Admin: items management
router.post('/items', verifyToken, requireAdmin, createItem)
router.patch('/items/:id', verifyToken, requireAdmin, updateItem)
router.delete('/items/:id', verifyToken, requireAdmin, disableItem)

// Admin: upsert daily price
router.post('/prices', verifyToken, requireAdmin, upsertPrice)
router.get('/prices/summary', verifyToken, requireAdmin, priceSummary)

// Farmer/Admin: read endpoints
router.get('/items', listItems)
router.get('/items/:id/trend', getTrend)
router.get('/compare', compareItems)

export default router

