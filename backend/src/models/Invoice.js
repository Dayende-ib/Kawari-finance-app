const { Schema, model } = require('mongoose');

const InvoiceItemSchema = new Schema({
  label: String,
  quantity: Number,
  unitPrice: Number,
});

const InvoiceSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  number: { type: String, unique: true },
  total: Number,
  issuedAt: Date,
  dueAt: Date,
  status: { type: String, default: 'PENDING' },
  items: [InvoiceItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = model('Invoice', InvoiceSchema);
