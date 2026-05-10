const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  subscribedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  source: { type: String, default: 'website' },
});

module.exports = mongoose.model('NewsletterSubscriber', subscriberSchema);
