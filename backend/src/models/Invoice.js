const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'XOF' },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

invoiceSchema.index({ createdBy: 1, dueDate: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
