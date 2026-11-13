const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrower: { type: String, required: true, trim: true, maxlength: 120 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['issued', 'returned'], default: 'issued' },
    returnedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);
