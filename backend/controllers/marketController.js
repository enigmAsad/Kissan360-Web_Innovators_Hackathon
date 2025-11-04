import MarketItem from '../models/marketItem.model.js';
import MarketPrice from '../models/marketPrice.model.js';

// POST /api/market/items - Create a new market item (Admin only)
export const createItem = async (req, res) => {
    try {
        const { name, category, unit, description } = req.body;
        const item = new MarketItem({ name, category, unit, description });
        await item.save();
        res.status(201).json({ message: 'Item created', item });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create item', error: err.message });
    }
};

// PATCH /api/market/items/:id - Update a market item (Admin only)
export const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const item = await MarketItem.findByIdAndUpdate(id, updates, { new: true });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item updated', item });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update item', error: err.message });
    }
};

// DELETE /api/market/items/:id - Soft delete (disable) a market item (Admin only)
export const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await MarketItem.findByIdAndUpdate(id, { enabled: false }, { new: true });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item disabled', item });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete item', error: err.message });
    }
};

// POST /api/market/prices - Create or update a price (Admin only)
export const createPrice = async (req, res) => {
    try {
        const { item, city, date, price, currency } = req.body;
        const result = await MarketPrice.findOneAndUpdate(
            { item, city, date },
            { price, currency },
            { new: true, upsert: true }
        );
        res.json({ message: 'Price saved', upserted: !result });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save price', error: err.message });
    }
};

// GET /api/market/items - Get all items or items with latest prices for a city
export const getItems = async (req, res) => {
    try {
        const { city, withCities } = req.query;
        const items = await MarketItem.find({ enabled: true });
        
        // If withCities is requested, attach all cities that have prices for each item
        if (withCities === 'true') {
            const itemsWithCities = await Promise.all(
                items.map(async (item) => {
                    const prices = await MarketPrice.find({ item: item._id }).distinct('city');
                    
                    return {
                        ...item.toObject(),
                        cities: prices || [],
                    };
                })
            );
            return res.json(itemsWithCities);
        }
        
        if (!city) {
            return res.json(items);
        }

        // If city is provided, attach latest price info
        const itemsWithPrices = await Promise.all(
            items.map(async (item) => {
                const latestPrice = await MarketPrice.findOne({ 
                    item: item._id, 
                    city 
                }).sort({ date: -1 });
                
                return {
                    ...item.toObject(),
                    latestPrice: latestPrice?.price || null,
                    lastUpdated: latestPrice?.date || null,
                };
            })
        );
        
        res.json(itemsWithPrices);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch items', error: err.message });
    }
};

// GET /api/market/items/:id/trend - Get price trend for an item in a city (7 days)
export const getItemTrend = async (req, res) => {
    try {
        const { id } = req.params;
        const { city } = req.query;
        
        if (!city) {
            return res.status(400).json({ message: 'City is required' });
        }

        const item = await MarketItem.findById(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const prices = await MarketPrice.find({
            item: id,
            city,
            date: { $gte: sevenDaysAgo }
        }).sort({ date: 1 });

        // Format data with date and price
        const data = prices.map(p => ({
            date: p.date.toISOString().split('T')[0],
            price: p.price
        }));

        res.json({ item, city, data });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch trend', error: err.message });
    }
};

// GET /api/market/compare - Compare multiple items in a city
export const compareItems = async (req, res) => {
    try {
        const { items, city } = req.query;
        
        if (!items || !city) {
            return res.status(400).json({ message: 'items and city are required' });
        }

        const itemIds = items.split(',');
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const series = await Promise.all(
            itemIds.map(async (itemId) => {
                const item = await MarketItem.findById(itemId);
                if (!item) return null;

                const prices = await MarketPrice.find({
                    item: itemId,
                    city,
                    date: { $gte: sevenDaysAgo }
                }).sort({ date: 1 });

                const data = prices.map(p => ({
                    date: p.date.toISOString().split('T')[0],
                    price: p.price
                }));

                return {
                    itemId: item._id,
                    name: item.name,
                    unit: item.unit,
                    data
                };
            })
        );

        res.json({ 
            city, 
            series: series.filter(s => s !== null) 
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to compare items', error: err.message });
    }
};

// GET /api/market/prices/summary - Get summary statistics (Admin only)
export const getPricesSummary = async (req, res) => {
    try {
        const { city } = req.query;
        const filter = city ? { city } : {};

        const totalItems = await MarketItem.countDocuments({ enabled: true });
        const totalPrices = await MarketPrice.countDocuments(filter);
        
        const avgResult = await MarketPrice.aggregate([
            ...(city ? [{ $match: { city } }] : []),
            { $group: { _id: null, avgPrice: { $avg: '$price' } } }
        ]);
        
        const lastPrice = await MarketPrice.findOne(filter).sort({ date: -1 });

        res.json({
            totalItems,
            totalPrices,
            avgPrice: avgResult[0]?.avgPrice || 0,
            lastPriceDate: lastPrice?.date || null
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch summary', error: err.message });
    }
};

// GET /api/market/cities - Get unique cities from price data
export const getCities = async (req, res) => {
    try {
        const cities = await MarketPrice.distinct('city');
        res.json(cities.sort());
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch cities', error: err.message });
    }
};

// GET /api/market/prices/item/:itemId - Get all prices for a specific item
export const getItemPrices = async (req, res) => {
    try {
        const { itemId } = req.params;
        const prices = await MarketPrice.find({ item: itemId }).sort({ city: 1, date: -1 });
        res.json(prices);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch item prices', error: err.message });
    }
};

// DELETE /api/market/prices/item/:itemId/city/:city - Delete all prices for an item in a specific city (Admin only)
export const deleteItemCityPrices = async (req, res) => {
    try {
        const { itemId, city } = req.params;
        const result = await MarketPrice.deleteMany({ item: itemId, city: city });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No price data found for this item in this city' });
        }
        res.json({ 
            message: 'Price data deleted successfully', 
            deletedCount: result.deletedCount 
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete price data', error: err.message });
    }
};