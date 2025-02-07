const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const MONGODB_URI = 'mongodb://localhost:27017/fundfair';

// MongoDB connection with detailed logging
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Successfully connected to MongoDB.');
    console.log('Database:', mongoose.connection.db.databaseName);
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('MongoDB error:', error);
});

db.once('open', () => {
    console.log('MongoDB connection established successfully');
});

// Schema Definitions
const transactionSchema = new mongoose.Schema({
    transactionHash: { type: String, required: true, unique: true },
    campaignId: { type: String, required: true },
    type: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: String, required: true },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const campaignSchema = new mongoose.Schema({
    campaignId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    target: String,
    deadline: Date,
    amountCollected: { type: String, default: '0' },
    owner: { type: String, required: true },
    image: String,
    donatorCount: { type: Number, default: 0 }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true },
    totalDonations: { type: String, default: '0' },
    campaignsCreated: { type: Number, default: 0 },
    totalDonated: { type: String, default: '0' },
    lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

// Models
const Transaction = mongoose.model('Transaction', transactionSchema);
const Campaign = mongoose.model('Campaign', campaignSchema);
const User = mongoose.model('User', userSchema);

// Transaction Routes
app.post('/api/transactions', async (req, res) => {
    try {
        console.log('Received transaction data:', req.body);
        const transaction = new Transaction(req.body);
        const savedTransaction = await transaction.save();

        // Update user stats if it's a donation
        if (req.body.type === 'DONATION') {
            await User.findOneAndUpdate(
                { address: req.body.from },
                { 
                    $inc: { totalDonated: req.body.amount },
                    $set: { lastActive: new Date() }
                },
                { upsert: true }
            );

            // Update campaign stats
            await Campaign.findOneAndUpdate(
                { campaignId: req.body.campaignId },
                { 
                    $inc: { 
                        donatorCount: 1,
                        amountCollected: req.body.amount 
                    }
                }
            );
        }

        res.status(201).json(savedTransaction);
    } catch (error) {
        console.error('Error saving transaction:', error);
        res.status(500).json({ error: error.message });
    }
});

// Campaign Routes
app.post('/api/campaigns', async (req, res) => {
    try {
        console.log('Received campaign data:', req.body);
        const campaign = new Campaign(req.body);
        const savedCampaign = await campaign.save();

        // Update user's campaign count
        await User.findOneAndUpdate(
            { address: req.body.owner },
            { 
                $inc: { campaignsCreated: 1 },
                $set: { lastActive: new Date() }
            },
            { upsert: true }
        );

        res.status(201).json(savedCampaign);
    } catch (error) {
        console.error('Error saving campaign:', error);
        res.status(500).json({ error: error.message });
    }
});

// User Routes
app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET routes for each collection
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find({});
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/campaigns', async (req, res) => {
    try {
        const campaigns = await Campaign.find({});
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MongoDB URI: ${MONGODB_URI}`);
});

// Handle process termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
}); 