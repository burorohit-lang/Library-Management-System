const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  type: { type: String, enum: ['Academic', 'Book Genre'], default: 'Academic' },
  description: { type: String, default: 'No description provided' }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
