import FarmerDetails from '../models/farmerDetail.model.js'

export const getRegion = async (req, res) => {
    try {
        const doc = await FarmerDetails.findOne({ user: req.userId }).select('region');
        res.json({ region: doc?.region || null });
    } catch (err) {
        res.status(500).json({ message: 'Failed to load region', error: err.message });
    }
}

export const updateRegion = async (req, res) => {
    try {
        const { region } = req.body;
        if (!region) return res.status(400).json({ message: 'region is required' });
        const updated = await FarmerDetails.findOneAndUpdate(
            { user: req.userId },
            { $set: { region } },
            { new: true, upsert: true }
        ).select('region');
        res.json({ message: 'Region saved', region: updated.region });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save region', error: err.message });
    }
}

