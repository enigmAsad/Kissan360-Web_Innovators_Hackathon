import mongoose from 'mongoose';

const marketItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    unit: {
        type: String,
        required: true,
        default: 'kg',
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    enabled: {
        type: Boolean,
        default: true,
    },
},
    {
        timestamps: true,
    },
);

export default mongoose.model('MarketItem', marketItemSchema);
