import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    transactionHash: {
        type: String,
        required: true,
        unique: true,
    },
    campaignId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['DONATION', 'WITHDRAWAL', 'CAMPAIGN_CREATION', 'REFUND'],
        required: true,
    },
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    amount: {
        type: String,  // Store as string to preserve precision
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {},
    }
});

const Transaction = mongoose.models?.Transaction || mongoose.model('Transaction', transactionSchema);

export const recordTransaction = async (transactionData) => {
    try {
        const transaction = new Transaction(transactionData);
        await transaction.save();
        console.log('Transaction recorded successfully:', transaction._id);
        return transaction;
    } catch (error) {
        console.error('Error recording transaction:', error);
        throw error;
    }
};

export const getTransactionsByAddress = async (address) => {
    try {
        return await Transaction.find({
            $or: [{ from: address }, { to: address }]
        }).sort({ timestamp: -1 });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};

export const getTransactionsByCampaign = async (campaignId) => {
    try {
        return await Transaction.find({ campaignId }).sort({ timestamp: -1 });
    } catch (error) {
        console.error('Error fetching campaign transactions:', error);
        throw error;
    }
};

export const donate = async (pId, amount) => {
    // ... existing code ...
    await recordTransaction({
        transactionHash: data.receipt.transactionHash,
        campaignId: pId,
        type: 'DONATION',
        from: address,
        to: contract.getAddress(),
        amount: amount,
        status: 'COMPLETED',
        metadata: {
            campaignId: pId
        }
    });
    // ... existing code ...
};

export default Transaction; 