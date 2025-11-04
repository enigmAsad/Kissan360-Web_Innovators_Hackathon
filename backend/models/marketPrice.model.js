import mongoose from 'mongoose'

const marketPriceSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MarketItem',
        required: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: 'PKR',
    },
    source: {
        type: String,
        default: '',
        trim: true,
    },
},
    {
        timestamps: true,
    },
)

marketPriceSchema.index({ item: 1, city: 1, date: 1 }, { unique: true })

export default mongoose.model('MarketPrice', marketPriceSchema)

