const { Schema, model } = require('mongoose');

const RefreshTokenSchema = new Schema({
  token: { type: String, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  expiresAt: Date,
  revoked: { type: Boolean, default: false },
  replacedBy: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = model('RefreshToken', RefreshTokenSchema);
