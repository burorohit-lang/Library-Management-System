const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, lowercase: true, trim: true },
  bookTitle: { type: String, required: true, trim: true },
  issueDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  returnDate: { type: String },
  fine: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Overdue', 'Returned', 'Rejected'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
