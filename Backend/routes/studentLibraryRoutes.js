const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Book = require('../models/Book');
const Issue = require('../models/Issue');
const SystemConfig = require('../models/SystemConfig');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'library_management_secret_key_2026';
}

// GET /api/library/student/dashboard
router.get(['/student/dashboard', '/student-dashboard', '/dashboard'], async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());

    const student = await User.findById(decoded.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const config = await SystemConfig.findOne();
    const finePerDay = config?.finePerDay ?? 10;

    // শিক্ষার্থীর ইমেইল (case-insensitive) অথবা studentId অনুযায়ী সব ট্রানজেকশন আনা
    const allTransactions = await Issue.find({
      $or: [
        { studentId: student._id },
        { studentEmail: { $regex: new RegExp(`^${student.email}$`, 'i') } }
      ]
    }).sort({ updatedAt: -1, createdAt: -1 });

    const today = new Date();
    let totalFines = 0;
    let overdueCount = 0;

    const formattedTransactions = allTransactions.map((item) => {
      const doc = item.toObject ? item.toObject() : { ...item };
      let calculatedFine = doc.fine || 0;
      let currentStatus = doc.status;

      if (['Active', 'Overdue'].includes(currentStatus) && doc.dueDate && doc.dueDate !== 'Pending Approval') {
        const parsedDue = new Date(doc.dueDate);
        if (!isNaN(parsedDue) && today > parsedDue) {
          currentStatus = 'Overdue';
          const diffTime = Math.abs(today - parsedDue);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          calculatedFine = diffDays * finePerDay;
        }
      }

      if (currentStatus === 'Overdue') overdueCount += 1;
      totalFines += calculatedFine;

      return {
        ...doc,
        status: currentStatus,
        fine: calculatedFine
      };
    });

    const activeBorrowed = formattedTransactions.filter((t) =>
      ['Active', 'Overdue'].includes(t.status)
    );
    const pendingRequests = formattedTransactions.filter((t) => t.status === 'Pending');
    const returnedHistory = formattedTransactions.filter((t) => t.status === 'Returned');

    const availableBooks = await Book.find().sort({ createdAt: -1 });

    res.status(200).json({
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        universityRoll: student.universityRoll || '',
        stream: student.stream || student.department || '',
        semester: student.semester || '',
        status: student.status || 'Active'
      },
      stats: {
        borrowedCount: activeBorrowed.length,
        pendingCount: pendingRequests.length,
        overdueCount,
        returnedCount: returnedHistory.length,
        totalFines,
        availableBooksCount: availableBooks.filter((b) => (b.availableCopies || 0) > 0).length
      },
      borrowedBooks: activeBorrowed,
      pendingRequests,
      history: formattedTransactions,
      availableBooks,
      finePerDay
    });
  } catch (error) {
    console.error('Student Dashboard Route Error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    res.status(500).json({
      message: 'Failed to fetch student dashboard data.',
      error: error.message
    });
  }
});

// POST /api/library/student/request-book
router.post(['/student/request-book', '/request-book'], async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());
    const student = await User.findById(decoded.id).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const { bookId, bookTitle } = req.body;
    const book = bookId
      ? await Book.findById(bookId)
      : await Book.findOne({ title: bookTitle });

    if (!book) {
      return res.status(404).json({ message: 'Book not found in library catalog.' });
    }

    if ((book.availableCopies ?? 0) <= 0) {
      return res.status(400).json({ message: 'This book is currently out of stock.' });
    }

    const existing = await Issue.findOne({
      studentEmail: { $regex: new RegExp(`^${student.email}$`, 'i') },
      bookTitle: book.title,
      status: { $in: ['Pending', 'Active', 'Overdue'] }
    });

    if (existing) {
      return res.status(400).json({
        message:
          existing.status === 'Pending'
            ? 'You have already requested this book. Waiting for librarian approval.'
            : 'You already have this book issued.'
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const requestPayload = {
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      universityRoll: student.universityRoll || '',
      stream: student.stream || student.department || '',
      semester: student.semester || '',
      bookId: book._id,
      bookTitle: book.title,
      bookAuthor: book.author || '',
      issueDate: todayStr,
      dueDate: 'Pending Approval',
      returnDate: '',
      fine: 0,
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const newRequest = new Issue(requestPayload);
      await newRequest.save();
    } catch (validationErr) {
      await Issue.collection.insertOne(requestPayload);
    }

    res.status(201).json({
      message: `Book request sent for "${book.title}"! Waiting for Librarian approval.`
    });
  } catch (error) {
    console.error('Student Book Request Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to submit book request.'
    });
  }
});

module.exports = router;