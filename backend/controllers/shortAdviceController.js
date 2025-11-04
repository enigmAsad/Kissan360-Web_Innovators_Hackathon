import MarketItem from '../models/marketItem.model.js';
import MarketPrice from '../models/marketPrice.model.js';

export const getShortAdvice = async (req, res) => {
    try {
        const { item: itemId, city, rainExpected } = req.query;

        if (!itemId || !city) {
            return res.status(400).json({ message: 'item and city are required' });
        }

        // Get item details
        const item = await MarketItem.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Get last 3 days of price data for trend analysis
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const prices = await MarketPrice.find({
            item: itemId,
            city,
            date: { $gte: threeDaysAgo }
        }).sort({ date: 1 }).lean();

        // Generate advice based on price trend
        let advice = [];
        
        if (prices.length >= 2) {
            const firstPrice = prices[0].price;
            const lastPrice = prices[prices.length - 1].price;
            const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

            if (priceChange > 10) {
                advice.push(`${item.name} prices rising (+${priceChange.toFixed(1)}%) - consider selling soon`);
                advice.push(`Market demand for ${item.name} is high in ${city}`);
            } else if (priceChange < -10) {
                advice.push(`${item.name} prices falling (${priceChange.toFixed(1)}%) - hold if possible`);
                advice.push(`Consider alternative markets or storage for ${item.name}`);
            } else {
                advice.push(`${item.name} prices stable in ${city} - good time for steady sales`);
            }
        } else {
            advice.push(`Limited price data for ${item.name} in ${city} - monitor market closely`);
        }

        // Add rain-specific advice
        if (rainExpected === 'true') {
            if (item.category === 'vegetable') {
                advice.push(`Rain expected - protect ${item.name} crops from excess moisture`);
                advice.push(`Consider harvesting mature ${item.name} before heavy rain`);
            } else if (item.category === 'fruit') {
                advice.push(`Rain expected - ensure proper drainage for ${item.name} orchards`);
            }
        } else {
            if (item.category === 'vegetable') {
                advice.push(`No rain expected - maintain irrigation for ${item.name}`);
            }
        }

        // Add general market advice
        advice.push(`Monitor ${city} market demand for ${item.name} regularly`);

        // Limit to 3-4 most relevant pieces of advice
        const finalAdvice = advice.slice(0, 4);

        res.json({
            item: {
                id: item._id,
                name: item.name,
                category: item.category
            },
            city,
            advice: finalAdvice
        });

    } catch (err) {
        console.error('Error generating short advice:', err);
        res.status(500).json({ message: 'Failed to generate advice', error: err.message });
    }
};