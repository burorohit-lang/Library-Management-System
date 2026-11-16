const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Issue = require('../models/Issue');
const SystemConfig = require('../models/SystemConfig');

// GET /api/librarian/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const config = await SystemConfig.findOne();
    const finePerDay = config?.finePerDay ?? 10;

    const allIssues = await Issue.find().sort({ createdAt: -1 });
    const books = await Book.find();
    const students = await User.find({ role: 'student' }).select('-password');

    const pendingRequests = allIssues.filter((i) => i.status === 'Pending');
    const activeIssues = allIssues.filter((i) => ['Active', 'Overdue'].includes(i.status));
    const overdueIssues = allIssues.filter((i) => i.status === 'Overdue');
    const totalFines = allIssues.reduce((sum, item) => sum + (item.fine || 0), 0);

    res.status(200).json({
      stats: {
        totalBooks: books.length,
        availableBooks: books.reduce((sum, b) => sum + (b.availableCopies || 0), 0),
        totalStudents: students.length,
        activeIssuesCount: activeIssues.length,
        pendingRequestsCount: pendingRequests.length,
        overdueCount: overdueIssues.length,
        totalFines
      },
      pendingRequests,
      activeIssues,
      recentLogs: allIssues.slice(0, 20),
      finePerDay
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load librarian dashboard.', error: error.message });
  }
});

// GET /api/librarian/requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await Issue.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending requests.', error: error.message });
  }
});

// PUT / POST / PATCH /api/librarian/handle-request/:id
router.all('/handle-request/:id', async (req, res) => {
  if (!['PUT', 'POST', 'PATCH'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const { id } = req.params;
    const actionRaw = (req.body?.action || req.body?.status || 'approve').toString().toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID.' });
    }

    const requestDoc = await Issue.findById(id);
    if (!requestDoc) {
      return res.status(404).json({ message: 'Book request not found.' });
    }

    // Reject করলে
    if (['reject', 'rejected', 'decline'].includes(actionRaw)) {
      await Issue.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        {
          $set: {
            status: 'Rejected',
            updatedAt: new Date()
          }
        }
      );

      return res.status(200).json({
        message: `Request for "${requestDoc.bookTitle}" has been rejected.`
      });
    }

    // Accept / Approve করলে
    const book = requestDoc.bookId
      ? await Book.findById(requestDoc.bookId)
      : await Book.findOne({ title: requestDoc.bookTitle });

    if (!book || (book.availableCopies ?? 0) <= 0) {
      return res.status(400).json({
        message: 'Cannot approve request: Book is currently out of stock.'
      });
    }

    const config = await SystemConfig.findOne();
    const loanDays = config?.defaultLoanDays || config?.maxBorrowDays || 14;

    const today = new Date();
    const due = new Date(today);
    due.setDate(today.getDate() + loanDays);

    const issueDateStr = today.toISOString().split('T')[0];
    const dueDateStr = req.body?.dueDate || due.toISOString().split('T')[0];

    await Issue.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          status: 'Active',
          issueDate: issueDateStr,
          dueDate: dueDateStr,
          updatedAt: new Date()
        }
      }
    );

    await Book.findByIdAndUpdate(book._id, {
      $inc: { availableCopies: -1 }
    });

    res.status(200).json({
      message: `Book "${requestDoc.bookTitle}" approved and issued to ${requestDoc.studentName}!`,
      issueDate: issueDateStr,
      dueDate: dueDateStr
    });
  } catch (error) {
    console.error('Handle Request Error:', error);
    res.status(500).json({
      message: 'Failed to process book request.',
      error: error.message
    });
  }
});

// GET /api/librarian/logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await Issue.find().sort({ updatedAt: -1, createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load circulation logs.', error: error.message });
  }
});

module.exports = router;