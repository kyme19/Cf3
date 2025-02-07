import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    totalDonations: {
        type: String,
        default: '0'
    },
    campaignsCreated: {
        type: Number,
        default: 0
    },
    totalDonated: {
        type: String,
        default: '0'
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    }
});

const User = mongoose.models?.User || mongoose.model('User', userSchema);
export default User; 