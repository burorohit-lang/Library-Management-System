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

    const allIssues = await Issue.find().sort({ updatedAt: -1, createdAt: -1 });
    const books = await Book.find().sort({ createdAt: -1 });
    const students = await User.find({ role: 'student' }).select('-password');

    const pendingRequests = allIssues.filter((i) => i.status === 'Pending');
    const activeIssues = allIssues.filter((i) => ['Active', 'Overdue', 'Issued'].includes(i.status));
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
      issues: allIssues,
      books,
      students,
      recentLogs: allIssues.slice(0, 25),
      finePerDay
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load librarian dashboard.', error: error.message });
  }
});

// GET /api/librarian/active-issues
router.get(['/active-issues', '/issues'], async (req, res) => {
  try {
    const issues = await Issue.find({
      status: { $in: ['Active', 'Overdue', 'Issued'] }
    }).sort({ updatedAt: -1, createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active issues.', error: error.message });
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

// POST /api/librarian/issue-book
router.post('/issue-book', async (req, res) => {
  try {
    const {
      studentId,
      studentEmail,
      studentName,
      universityRoll,
      bookId,
      bookTitle,
      issueDate,
      dueDate
    } = req.body;

    let student = null;
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      student = await User.findById(studentId).select('-password');
    }
    if (!student && studentEmail) {
      student = await User.findOne({
        email: { $regex: new RegExp(`^${studentEmail.trim()}$`, 'i') }
      }).select('-password');
    }
    if (!student && universityRoll) {
      student = await User.findOne({
        universityRoll: universityRoll.trim()
      }).select('-password');
    }

    const finalStudentName = student?.name || studentName?.trim();
    const finalStudentEmail = student?.email || studentEmail?.trim()?.toLowerCase();

    if (!finalStudentName || !finalStudentEmail) {
      return res.status(400).json({ message: 'Student name and email are required.' });
    }

    let book = null;
    if (bookId && mongoose.Types.ObjectId.isValid(bookId)) {
      book = await Book.findById(bookId);
    }
    if (!book && bookTitle) {
      book = await Book.findOne({
        title: { $regex: new RegExp(`^${bookTitle.trim()}$`, 'i') }
      });
    }

    if (!book) {
      return res.status(404).json({ message: 'Selected book not found.' });
    }

    if ((book.availableCopies ?? 0) <= 0) {
      return res.status(400).json({ message: `"${book.title}" is out of stock.` });
    }

    const config = await SystemConfig.findOne();
    const loanDays = config?.defaultLoanDays || config?.maxBorrowDays || 14;

    const today = new Date();
    const defaultDue = new Date(today);
    defaultDue.setDate(today.getDate() + loanDays);

    const finalIssueDate = issueDate || today.toISOString().split('T')[0];
    const finalDueDate = dueDate || defaultDue.toISOString().split('T')[0];

    const issuePayload = {
      studentId: student?._id || null,
      studentName: finalStudentName,
      studentEmail: finalStudentEmail,
      universityRoll: student?.universityRoll || universityRoll || '',
      stream: student?.stream || student?.department || '',
      semester: student?.semester || '',
      bookId: book._id,
      bookTitle: book.title,
      bookAuthor: book.author || '',
      issueDate: finalIssueDate,
      dueDate: finalDueDate,
      returnDate: '',
      fine: 0,
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let savedDoc;
    try {
      const created = new Issue(issuePayload);
      savedDoc = await created.save();
    } catch (e) {
      const inserted = await Issue.collection.insertOne(issuePayload);
      savedDoc = { _id: inserted.insertedId, ...issuePayload };
    }

    await Book.findByIdAndUpdate(book._id, {
      $inc: { availableCopies: -1 }
    });

    res.status(201).json({
      message: `Book "${book.title}" issued to ${finalStudentName}!`,
      issue: savedDoc
    });
  } catch (error) {
    console.error('Librarian Issue Book Error:', error);
    res.status(500).json({ message: 'Failed to issue book.', error: error.message });
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

    if (['reject', 'rejected', 'decline'].includes(actionRaw)) {
      await Issue.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { status: 'Rejected', updatedAt: new Date() } }
      );
      return res.status(200).json({ message: `Request for "${requestDoc.bookTitle}" rejected.` });
    }

    const book = requestDoc.bookId
      ? await Book.findById(requestDoc.bookId)
      : await Book.findOne({ title: requestDoc.bookTitle });

    if (!book || (book.availableCopies ?? 0) <= 0) {
      return res.status(400).json({ message: 'Book is out of stock.' });
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

    await Book.findByIdAndUpdate(book._id, { $inc: { availableCopies: -1 } });

    res.status(200).json({
      message: `Book "${requestDoc.bookTitle}" approved and issued to ${requestDoc.studentName}!`,
      issueDate: issueDateStr,
      dueDate: dueDateStr
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process request.', error: error.message });
  }
});

// PUT / POST / PATCH /api/librarian/return-book/:id
router.all(['/return-book/:id', '/return/:id'], async (req, res) => {
  if (!['PUT', 'POST', 'PATCH'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid issue ID.' });
    }

    const issueDoc = await Issue.findById(id);
    if (!issueDoc) {
      return res.status(404).json({ message: 'Issue record not found.' });
    }

    if (issueDoc.status === 'Returned') {
      return res.status(400).json({ message: 'This book has already been returned.' });
    }

    const config = await SystemConfig.findOne();
    const finePerDay = config?.finePerDay ?? 10;

    const today = new Date();
    const returnDateStr = today.toISOString().split('T')[0];
    let finalFine = issueDoc.fine || 0;

    if (issueDoc.dueDate && issueDoc.dueDate !== 'Pending Approval') {
      const parsedDue = new Date(issueDoc.dueDate);
      if (!isNaN(parsedDue) && today > parsedDue) {
        const diffTime = Math.abs(today - parsedDue);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        finalFine = diffDays * finePerDay;
      }
    }

    await Issue.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          status: 'Returned',
          returnDate: returnDateStr,
          fine: finalFine,
          updatedAt: new Date()
        }
      }
    );

    if (issueDoc.bookId && mongoose.Types.ObjectId.isValid(issueDoc.bookId)) {
      await Book.findByIdAndUpdate(issueDoc.bookId, { $inc: { availableCopies: 1 } });
    } else if (issueDoc.bookTitle) {
      await Book.findOneAndUpdate({ title: issueDoc.bookTitle }, { $inc: { availableCopies: 1 } });
    }

    res.status(200).json({
      message: `Book "${issueDoc.bookTitle}" marked as returned!`,
      returnDate: returnDateStr,
      fine: finalFine
    });
  } catch (error) {
    console.error('Return Book Error:', error);
    res.status(500).json({ message: 'Failed to return book.', error: error.message });
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