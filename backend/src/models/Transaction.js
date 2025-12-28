const { Schema, model } = require('mongoose');

const TransactionSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerName: String,
  type: String,
  amount: Number,
  currency: { type: String, default: 'XOF' },
  date: { type: Date, default: Date.now },
  description: String,
  paymentMethod: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = model('Transaction', TransactionSchema);
