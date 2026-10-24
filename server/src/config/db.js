const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spend-smart';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB (${error.message}).`);
    console.warn(`[Database Notice] Please verify your MongoDB service is running or provide a valid MONGODB_URI in server/.env.`);
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }
    return null;
  }
};

module.exports = connectDB;
