const { Schema, model } = require('mongoose');

const InvoiceItemSchema = new Schema({
  label: String,
  quantity: Number,
  unitPrice: Number,
});

const InvoiceSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerName: String,
  number: { type: String, unique: true, sparse: true },
  total: Number,
  issuedAt: Date,
  dueAt: Date,
  status: { type: String, default: 'PENDING' },
  templateName: { type: String, default: 'default' },
  items: [InvoiceItemSchema],
  version: { type: Number, default: 1 },
  versions: [
    {
      version: Number,
      snapshot: Schema.Types.Mixed,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = model('Invoice', InvoiceSchema);
