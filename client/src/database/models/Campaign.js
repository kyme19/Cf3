import mongoose from 'mongoose';

// Check if mongoose is connected
const campaignSchema = new mongoose.Schema({
    campaignId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    target: String,
    deadline: Date,
    amountCollected: {
        type: String,
        default: '0'
    },
    owner: {
        type: String,
        required: true
    },
    image: String,
    isRefunded: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'COMPLETED', 'REFUNDED'],
        default: 'ACTIVE'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    donatorCount: {
        type: Number,
        default: 0
    }
});

// Use this pattern to prevent model recompilation errors
const Campaign = mongoose.models?.Campaign || mongoose.model('Campaign', campaignSchema);
export default Campaign; 