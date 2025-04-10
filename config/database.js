const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            user: process.env.MONGODB_USER,
            pass: process.env.MONGODB_PASSWORD,
            // Additional security options
            ssl: process.env.NODE_ENV === 'production', // Use SSL in production
            authSource: 'admin', // Specify authentication database
            retryWrites: true,
            w: 'majority' // Write concern for data consistency
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 