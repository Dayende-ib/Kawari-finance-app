const mongoose = require('mongoose');

const connect = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kawari';
    await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB_NAME || undefined });
    console.info('Connected to MongoDB', mongoUri);
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

module.exports = { connect, mongoose };
