import mongoose from 'mongoose'

const farmerDetailSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    region: {
        type: String,
        default: null,
    },
},
    {
        timestamps: true,
    },
);

export default mongoose.model('FarmerDetail', farmerDetailSchema);

