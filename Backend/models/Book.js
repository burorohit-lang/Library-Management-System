const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, trim: true, default: 'N/A' },
  category: { type: String, required: true, trim: true },
  totalCopies: { type: Number, required: true, default: 1, min: 1 },
  availableCopies: { type: Number, required: true, default: 1, min: 0 },
  shelfLocation: { type: String, default: 'Main Rack', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
