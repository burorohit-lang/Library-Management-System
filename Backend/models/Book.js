const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, trim: true, default: 'N/A' },
  category: { type: String, required: true, trim: true },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 },
  shelfLocation: { type: String, default: 'Main Rack' }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
