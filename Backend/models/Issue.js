const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    universityRoll: {
      type: String,
      default: ''
    },
    stream: {
      type: String,
      default: ''
    },
    semester: {
      type: String,
      default: ''
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: false
    },
    bookTitle: {
      type: String,
      required: true,
      trim: true
    },
    bookAuthor: {
      type: String,
      default: ''
    },
    issueDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    dueDate: {
      type: String,
      default: '' // লাইব্রেরিয়ান অ্যাপ্রুভ করার সময় সেট হবে
    },
    returnDate: {
      type: String,
      default: ''
    },
    fine: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Returned', 'Overdue', 'Rejected'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);