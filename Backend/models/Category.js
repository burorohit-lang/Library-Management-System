const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  type: { type: String, required: true, trim: true, default: 'General' },
  description: { type: String, default: 'No description provided', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
