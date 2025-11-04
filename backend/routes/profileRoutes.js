import express from 'express'
import { verifyToken } from '../middleware/jwt.js'
import { requireFarmer } from '../middleware/roles.js'
import { getRegion, updateRegion } from '../controllers/farmerPreferenceController.js'

const router = express.Router()

router.get('/region', verifyToken, requireFarmer, getRegion)
router.put('/region', verifyToken, requireFarmer, updateRegion)

export default router

