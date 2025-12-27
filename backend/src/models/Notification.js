const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  type: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model('Notification', NotificationSchema);
