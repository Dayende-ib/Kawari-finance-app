const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name: String,
  companyName: String,
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  role: { type: String, enum: ['super_admin', 'admin', 'seller'], default: 'seller' },
  companyId: { type: Schema.Types.ObjectId, ref: 'User' },
  suspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = model('User', UserSchema);
