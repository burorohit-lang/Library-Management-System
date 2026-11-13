const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    author: { type: String, required: true, trim: true, maxlength: 120 },
    isbn: { type: String, required: true, unique: true, trim: true, maxlength: 32 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    totalCopies: { type: Number, required: true, min: 1, validate: Number.isInteger },
    availableCopies: { type: Number, required: true, min: 0, validate: Number.isInteger }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
