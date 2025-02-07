import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import connectDB from '../config.js';

export const recordTransaction = async (transactionData) => {
    try {
        // Ensure database connection
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }

        console.log('Attempting to record transaction:', transactionData);
        
        // Create transaction document with enhanced metadata
        const enhancedTransactionData = {
            ...transactionData,
            metadata: {
                ...transactionData.metadata,
                functionName: transactionData.functionName || 'Unknown Function',
                functionType: transactionData.functionType || 'Unknown Type',
                timestamp: new Date(),
                gasUsed: transactionData.receipt?.gasUsed?.toString() || '0',
                blockNumber: transactionData.receipt?.blockNumber || 0,
            }
        };

        try {
            // Use create method instead of new + save
            const savedTransaction = await Transaction.create(enhancedTransactionData);
            
            console.log('Transaction recorded successfully in MongoDB:', {
                id: savedTransaction._id,
                hash: savedTransaction.transactionHash,
                type: savedTransaction.type,
                function: savedTransaction.metadata.functionName,
                amount: savedTransaction.amount
            });
            
            return savedTransaction;
        } catch (mongoError) {
            console.error('MongoDB Error:', mongoError);
            // If it's a duplicate key error, we'll try to update instead
            if (mongoError.code === 11000) {
                const updatedTransaction = await Transaction.findOneAndUpdate(
                    { transactionHash: transactionData.transactionHash },
                    enhancedTransactionData,
                    { new: true, upsert: true }
                );
                console.log('Transaction updated in MongoDB:', updatedTransaction._id);
                return updatedTransaction;
            }
            throw mongoError;
        }
    } catch (error) {
        console.error('Error recording transaction to MongoDB:', error);
        throw error;
    }
};

export const getTransactionsByAddress = async (address) => {
    if (mongoose.connection.readyState !== 1) {
        await connectDB();
    }
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
    if (mongoose.connection.readyState !== 1) {
        await connectDB();
    }
    try {
        return await Transaction.find({ campaignId }).sort({ timestamp: -1 });
    } catch (error) {
        console.error('Error fetching campaign transactions:', error);
        throw error;
    }
};

export const updateTransactionStatus = async (transactionHash, status) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { transactionHash },
            { status },
            { new: true }
        );
        return transaction;
    } catch (error) {
        console.error('Error updating transaction status:', error);
        throw error;
    }
}; 