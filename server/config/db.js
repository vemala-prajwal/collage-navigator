const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-navigator');
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('MongoDB connection failed, continuing without a database:', error.message);
  }
};

module.exports = connectDB;
