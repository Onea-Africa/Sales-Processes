const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  message: { type: String, required: true },
  service: { type: String, default: '' },
  serviceInterest: { type: String, enum: ['connect', 'communicate', 'converse', 'general'], default: 'general' },
  recaptchaScore: { type: Number },
  source: { type: String, default: 'website' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Enquiry', enquirySchema);
