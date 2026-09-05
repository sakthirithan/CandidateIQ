const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/candidate_profiling', {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[Database] Warning: MongoDB Connection Failed (${error.message}). Running in fallback mode.`);
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
