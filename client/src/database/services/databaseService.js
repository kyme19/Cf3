import mongoose from 'mongoose';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import connectDB from '../config.js';

// Ensure database connection before any operation
const ensureConnection = async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error('Failed to ensure database connection:', error);
        throw error;
    }
};

// Campaign Services
export const createCampaignRecord = async (campaignData) => {
    try {
        await ensureConnection();
        const campaign = await Campaign.create(campaignData);
        await updateUserCampaignCount(campaignData.owner);
        return campaign;
    } catch (error) {
        console.error('Error creating campaign record:', error);
        throw error;
    }
};

export const updateCampaignStats = async (campaignId, amount) => {
    try {
        await ensureConnection();
        return await Campaign.findOneAndUpdate(
            { campaignId },
            { 
                $inc: { 
                    donatorCount: 1,
                    amountCollected: amount 
                }
            },
            { new: true }
        );
    } catch (error) {
        console.error('Error updating campaign stats:', error);
        throw error;
    }
};

// User Services
export const createOrUpdateUser = async (address) => {
    try {
        await ensureConnection();
        return await User.findOneAndUpdate(
            { address },
            { 
                $set: { lastActive: new Date() }
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Error creating/updating user:', error);
        throw error;
    }
};

export const updateUserStats = async (address, amount) => {
    try {
        await ensureConnection();
        return await User.findOneAndUpdate(
            { address },
            { 
                $inc: { totalDonated: amount },
                $set: { lastActive: new Date() }
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Error updating user stats:', error);
        throw error;
    }
};

// Transaction Services
export const recordTransaction = async (transactionData) => {
    try {
        await ensureConnection();
        console.log('Connected to MongoDB, attempting to record transaction:', {
            hash: transactionData.transactionHash,
            type: transactionData.type,
            amount: transactionData.amount
        });

        // Create transaction document with enhanced metadata
        const enhancedTransactionData = {
            ...transactionData,
            metadata: {
                ...transactionData.metadata,
                timestamp: new Date(),
            }
        };

        // Use create method
        const savedTransaction = await Transaction.create(enhancedTransactionData);
        console.log('Transaction recorded successfully:', savedTransaction._id);

        // Update campaign stats if it's a donation
        if (transactionData.type === 'DONATION') {
            console.log('Updating campaign and user stats for donation');
            await updateCampaignStats(transactionData.campaignId, transactionData.amount);
            await updateUserStats(transactionData.from, transactionData.amount);
        }

        return savedTransaction;
    } catch (error) {
        console.error('Error recording transaction:', error);
        throw error;
    }
};

// Query Services
export const getCampaignDetails = async (campaignId) => {
    try {
        await ensureConnection();
        const campaign = await Campaign.findOne({ campaignId });
        const transactions = await Transaction.find({ campaignId })
            .sort({ timestamp: -1 });
        
        return {
            ...campaign.toObject(),
            transactions
        };
    } catch (error) {
        console.error('Error fetching campaign details:', error);
        throw error;
    }
};

export const getUserProfile = async (address) => {
    try {
        await ensureConnection();
        const user = await User.findOne({ address });
        const campaigns = await Campaign.find({ owner: address });
        const transactions = await Transaction.find({
            $or: [{ from: address }, { to: address }]
        }).sort({ timestamp: -1 });

        return {
            userDetails: user || { address },
            campaigns,
            transactions
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

const updateUserCampaignCount = async (address) => {
    try {
        await ensureConnection();
        return await User.findOneAndUpdate(
            { address },
            { 
                $inc: { campaignsCreated: 1 },
                $set: { lastActive: new Date() }
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Error updating user campaign count:', error);
        throw error;
    }
}; 