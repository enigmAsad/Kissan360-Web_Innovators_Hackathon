import MarketItem from '../models/marketItem.model.js'
import MarketPrice from '../models/marketPrice.model.js'

const toStartOfDay = (dateStr) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
}

export const createItem = async (req, res) => {
    try {
        const { name, category, unit, description } = req.body;
        if (!name || !category) return res.status(400).json({ message: 'name and category are required' });
        const item = await MarketItem.create({ name: name.trim(), category, unit, description });
        res.status(201).json({ message: 'Item created', item });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create item', error: err.message });
    }
}

export const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const allowed = ['name', 'category', 'unit', 'description', 'enabled'];
        const updates = {};
        for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
        const item = await MarketItem.findByIdAndUpdate(id, updates, { new: true });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item updated', item });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update item', error: err.message });
    }
}

export const disableItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await MarketItem.findByIdAndUpdate(id, { enabled: false }, { new: true });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item disabled', item });
    } catch (err) {
        res.status(500).json({ message: 'Failed to disable item', error: err.message });
    }
}

export const listItems = async (req, res) => {
    try {
        const { city } = req.query;
        const items = await MarketItem.find({ enabled: true }).sort({ name: 1 });
        if (!city) return res.json(items);
        // attach latest price per city
        const result = [];
        for (const item of items) {
            const latest = await MarketPrice.findOne({ item: item._id, city }).sort({ date: -1 });
            result.push({ ...item.toObject(), latestPrice: latest ? latest.price : null, lastUpdated: latest ? latest.date : null });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Failed to list items', error: err.message });
    }
}

export const upsertPrice = async (req, res) => {
    try {
        const { item, city, date, price, currency, source } = req.body;
        if (!item || !city || !date || typeof price !== 'number') {
            return res.status(400).json({ message: 'item, city, date, price are required' });
        }
        const day = toStartOfDay(date);
        const update = { price, currency: currency || 'PKR', source: source || '' };
        const result = await MarketPrice.updateOne({ item, city, date: day }, { $set: update }, { upsert: true });
        res.status(200).json({ message: 'Price saved', upserted: !!result.upsertedCount });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save price', error: err.message });
    }
}

const last7Days = () => {
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d);
    }
    return days;
}

export const getTrend = async (req, res) => {
    try {
        const { id } = req.params;
        const { city } = req.query;
        if (!city) return res.status(400).json({ message: 'city is required' });
        const item = await MarketItem.findById(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        const days = last7Days();
        const start = days[0];
        const end = days[days.length - 1];
        const prices = await MarketPrice.find({ item: id, city, date: { $gte: start, $lte: end } }).lean();
        const map = new Map(prices.map(p => [new Date(p.date).toISOString().slice(0,10), p.price]));
        const data = [];
        let lastKnown = null;
        for (const d of days) {
            const key = d.toISOString().slice(0,10);
            let val = map.get(key);
            if (val == null) val = lastKnown; // simple simulation: carry forward
            if (val == null) val = null;
            else lastKnown = val;
            data.push({ date: key, price: val });
        }
        res.json({ item: { id: item._id, name: item.name, category: item.category, unit: item.unit }, city, data });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch trend', error: err.message });
    }
}

export const compareItems = async (req, res) => {
    try {
        const { items, city } = req.query;
        if (!items || !city) return res.status(400).json({ message: 'items (comma-separated) and city are required' });
        const ids = items.split(',').map(s => s.trim()).filter(Boolean);
        const found = await MarketItem.find({ _id: { $in: ids } });
        const days = last7Days();
        const start = days[0];
        const end = days[days.length - 1];
        const series = [];
        for (const item of found) {
            const prices = await MarketPrice.find({ item: item._id, city, date: { $gte: start, $lte: end } }).lean();
            const map = new Map(prices.map(p => [new Date(p.date).toISOString().slice(0,10), p.price]));
            const data = [];
            let lastKnown = null;
            for (const d of days) {
                const key = d.toISOString().slice(0,10);
                let val = map.get(key);
                if (val == null) val = lastKnown;
                if (val == null) val = null;
                else lastKnown = val;
                data.push({ date: key, price: val });
            }
            series.push({ itemId: item._id.toString(), name: item.name, unit: item.unit, data });
        }
        res.json({ city, series });
    } catch (err) {
        res.status(500).json({ message: 'Failed to compare items', error: err.message });
    }
}

export const priceSummary = async (req, res) => {
    try {
        const { city } = req.query;
        const match = {};
        if (city) match.city = city;
        const totalItems = await MarketItem.countDocuments({ enabled: true });
        const totalPrices = await MarketPrice.countDocuments(match);
        const avgAgg = await MarketPrice.aggregate([
            { $match: match },
            { $group: { _id: null, avgPrice: { $avg: '$price' } } }
        ]);
        const latest = await MarketPrice.find(match).sort({ date: -1 }).limit(1).lean();
        res.json({
            totalItems,
            totalPrices,
            avgPrice: avgAgg.length ? avgAgg[0].avgPrice : null,
            lastPriceDate: latest.length ? latest[0].date : null
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to compute summary', error: err.message });
    }
}

