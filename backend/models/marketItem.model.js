import mongoose from 'mongoose'

const marketItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        enum: ['vegetable', 'fruit'],
        required: true,
    },
    unit: {
        type: String,
        default: 'kg',
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
)

marketItemSchema.index({ name: 1, category: 1 }, { unique: true })

export default mongoose.model('MarketItem', marketItemSchema)

