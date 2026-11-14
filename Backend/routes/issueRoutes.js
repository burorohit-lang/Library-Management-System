const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Book = require('../models/Book');
const User = require('../models/User');
const SystemConfig = require('../models/SystemConfig');


const getActiveIssuesHandler = async (req, res) => {
  try {
    const config = await SystemConfig.findOne();
    const finePerDay = config?.finePerDay ?? 10;
    const today = new Date();

    const issues = await Issue.find({ status: { $in: ['Active', 'Overdue'] } }).sort({ createdAt: -1 });
    const updatedIssues = await Promise.all(
      issues.map(async (item) => {
        const due = new Date(item.dueDate);
        if (today > due) {
          const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
          item.status = 'Overdue';
          item.fine = diffDays * finePerDay;
          await item.save();
        }
        return item;
      })
    );
    res.status(200).json(updatedIssues);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active issues', error: error.message });
  }
};

router.get('/', getActiveIssuesHandler);
router.get('/active', getActiveIssuesHandler);


router.get('/requests', async (req, res) => {
  try {
    const pendingRequests = await Issue.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending requests', error: error.message });
  }
});


router.put('/:id/approve', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Request not found' });
    if (issue.status !== 'Pending') return res.status(400).json({ message: 'This request is already processed.' });

    const book = await Book.findOne({ title: { $regex: new RegExp(`^${issue.bookTitle}$`, 'i') } });
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: `Cannot approve: "${issue.bookTitle}" is out of stock!` });
    }

  
    book.availableCopies -= 1;
    await book.save();


    const todayStr = new Date().toISOString().split('T')[0];
    const origIssue = new Date(issue.issueDate);
    const origDue = new Date(issue.dueDate);
    const durationMs = Math.max(24 * 60 * 60 * 1000, origDue - origIssue);
    const newDueStr = new Date(Date.now() + durationMs).toISOString().split('T')[0];

    issue.issueDate = todayStr;
    issue.dueDate = req.body?.dueDate || newDueStr;
    issue.status = 'Active';
    await issue.save();

    res.status(200).json({ message: `Approved! "${issue.bookTitle}" is now issued to ${issue.studentName}.`, issue });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve request', error: error.message });
  }
});


router.put('/:id/reject', async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true });
    if (!issue) return res.status(404).json({ message: 'Request not found' });
    res.status(200).json({ message: 'Book request rejected.', issue });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject request', error: error.message });
  }
});

//  Issue Historyrouter.get('/history', async (req, res) => {
  try {
    const config = await SystemConfig.findOne();
    const finePerDay = config?.finePerDay ?? 10;
    const returnedIssues = await Issue.find({ status: 'Returned' }).sort({ updatedAt: -1 });

    const formatted = await Promise.all(
      returnedIssues.map(async (item) => {
        const book = await Book.findOne({ title: { $regex: new RegExp(`^${item.bookTitle}$`, 'i') } });
        const due = new Date(item.dueDate);
        const returned = new Date(item.returnDate || item.updatedAt);
        const overdueDays = returned > due ? Math.ceil((returned - due) / (1000 * 60 * 60 * 24)) : 0;
        return {
          _id: item._id,
          studentName: item.studentName,
          studentEmail: item.studentEmail,
          bookTitle: item.bookTitle,
          isbn: book?.isbn || 'N/A',
          issueDate: item.issueDate,
          dueDate: item.dueDate,
          returnDate: item.returnDate || new Date(item.updatedAt).toISOString().split('T')[0],
          overdueDays,
          fine: item.fine || overdueDays * finePerDay,
          status: overdueDays > 0 ? 'Returned Late' : 'Returned on Time'
        };
      })
    );
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load history', error: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const { studentName, studentEmail, bookTitle, issueDate, dueDate } = req.body;
    const cleanEmail = studentEmail.toLowerCase().trim();
    const cleanTitle = bookTitle.trim();

    const student = await User.findOne({ email: cleanEmail, role: 'student' });
    if (student && student.status === 'Deactive') {
      return res.status(403).json({ message: 'This student account is deactivated.' });
    }

    const config = await SystemConfig.findOne();
    const maxBooks = config?.maxBooksPerStudent ?? 3;
    const currentCount = await Issue.countDocuments({ studentEmail: cleanEmail, status: { $in: ['Active', 'Overdue'] } });
    if (currentCount >= maxBooks) {
      return res.status(400).json({ message: `Student already has ${currentCount} active books (Max limit: ${maxBooks}).` });
    }

    const book = await Book.findOne({ title: { $regex: new RegExp(`^${cleanTitle}$`, 'i') } });
    if (book) {
      if (book.availableCopies <= 0) return res.status(400).json({ message: `"${book.title}" is Out of Stock!` });
      book.availableCopies -= 1;
      await book.save();
    }

    const newIssue = new Issue({
      studentName: student?.name || studentName.trim(),
      studentEmail: cleanEmail,
      bookTitle: book?.title || cleanTitle,
      issueDate,
      dueDate,
      status: 'Active',
      fine: 0
    });
    const saved = await newIssue.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to issue book', error: error.message });
  }
});


router.put('/:id/extend', async (req, res) => {
  try {
    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { dueDate: req.body.newDueDate, status: 'Active', fine: 0 },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to extend due date', error: error.message });
  }
});

router.put('/:id/return', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue record not found' });

    const config = await SystemConfig.findOne();
    const finePerDay = config?.finePerDay ?? 10;
    const todayStr = new Date().toISOString().split('T')[0];
    const due = new Date(issue.dueDate);
    const today = new Date();
    const overdueDays = today > due ? Math.ceil((today - due) / (1000 * 60 * 60 * 24)) : 0;

    issue.status = 'Returned';
    issue.returnDate = todayStr;
    issue.fine = overdueDays * finePerDay;
    await issue.save();

    const book = await Book.findOne({ title: { $regex: new RegExp(`^${issue.bookTitle}$`, 'i') } });
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }
    res.status(200).json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Failed to return book', error: error.message });
  }
});

module.exports = router;
