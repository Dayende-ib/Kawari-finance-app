const mongoose = require('mongoose');

const ensureInvoiceNumberIndex = async () => {
  const collection = mongoose.connection.db.collection('invoices');
  const indexes = await collection.indexes();
  const numberIndex = indexes.find((idx) => idx.name === 'number_1');
  if (numberIndex && !numberIndex.sparse && !numberIndex.partialFilterExpression) {
    await collection.dropIndex('number_1');
  }
  await collection.createIndex({ number: 1 }, { unique: true, sparse: true });
};

const connect = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kawari';
    await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB_NAME || undefined });
    console.info('Connected to MongoDB', mongoUri);
    await ensureInvoiceNumberIndex();
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

module.exports = { connect, mongoose };
