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

// Transaction Schema with timestamps
const transactionSchema = new mongoose.Schema({
    transactionHash: { 
        type: String, 
        required: true, 
        unique: true 
    },
    campaignId: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    from: { 
        type: String, 
        required: true 
    },
    to: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        required: true 
    },
    metadata: { 
        type: Map, 
        of: mongoose.Schema.Types.Mixed 
    }
}, { 
    timestamps: true 
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// API Routes with detailed logging
app.post('/api/transactions', async (req, res) => {
    try {
        console.log('Received transaction data:', req.body);
        
        const transaction = new Transaction(req.body);
        console.log('Created transaction document:', transaction);
        
        const savedTransaction = await transaction.save();
        console.log('Saved transaction to MongoDB:', savedTransaction);
        
        res.status(201).json(savedTransaction);
    } catch (error) {
        console.error('Error saving transaction:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Get all transactions route
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find({});
        console.log('Retrieved transactions:', transactions.length);
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
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