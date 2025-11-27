const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['sale', 'expense'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'XOF' },
    category: { type: String },
    description: { type: String },
    date: { type: Date, default: Date.now },
    counterparty: { type: String }, // client or supplier
    paymentMethod: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

transactionSchema.index({ createdBy: 1, date: -1 });
transactionSchema.index({ type: 1, createdBy: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
