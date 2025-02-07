import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/fundfair';

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    try {
        if (cached.conn) {
            console.log('Using cached MongoDB connection');
            return cached.conn;
        }

        if (!cached.promise) {
            const opts = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            };

            console.log('Connecting to MongoDB...');
            cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
                console.log('MongoDB Connected Successfully');
                return mongoose;
            });
        }

        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

export default connectDB;
