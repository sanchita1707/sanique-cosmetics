const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sanique-cosmetics';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to main MongoDB: ${error.message}`);
    if (uri !== 'mongodb://localhost:27017/sanique-cosmetics') {
      console.log('Attempting fallback to local MongoDB...');
      try {
        const localConn = await mongoose.connect('mongodb://localhost:27017/sanique-cosmetics');
        console.log(`MongoDB Connected (Local Fallback): ${localConn.connection.host}`);
      } catch (localError) {
        console.error(`Local fallback connection failed: ${localError.message}`);
        console.warn('Warning: Server started without MongoDB connection.');
      }
    } else {
      console.warn('Warning: Server started without MongoDB connection.');
    }
  }
};

module.exports = connectDB;
