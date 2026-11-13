const mongoose = require('mongoose');
const { Schema } = mongoose;

const issueTransactionSchema = new Schema({
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  bookTitle: { type: String, required: true },
  issueDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  returnDate: { type: String, default: null },
  fine: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Active', 'Overdue', 'Returned'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('IssueTransaction', issueTransactionSchema);