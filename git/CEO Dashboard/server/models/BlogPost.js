const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  body: { type: String, required: true },
  category: { type: String, enum: ['Connectivity', 'Business', 'Digital Marketing'], required: true },
  author: { type: String, required: true },
  authorRole: { type: String },
  published: { type: Boolean, default: false },
  readTime: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

blogPostSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
