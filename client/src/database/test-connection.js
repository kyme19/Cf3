import connectDB from './config';
import Transaction from './models/Transaction';

const testConnection = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        
        // Create a test transaction
        const testTransaction = new Transaction({
            transactionHash: '0x' + Math.random().toString(36).substring(2, 15),
            campaignId: '1',
            type: 'DONATION',
            from: '0xTestAddress1',
            to: '0xTestAddress2',
            amount: '0.1',
            status: 'COMPLETED',
            metadata: {
                test: true
            }
        });

        // Save the test transaction
        await testTransaction.save();
        console.log('Test transaction saved successfully:', testTransaction);

        // Query the transaction back
        const savedTransaction = await Transaction.findOne({ _id: testTransaction._id });
        console.log('Retrieved transaction:', savedTransaction);

    } catch (error) {
        console.error('Database test failed:', error);
    }
};

testConnection(); 