const express = require('express');
const Book = require('../models/Book');
const Issue = require('../models/Issue');
const { allowRoles, requireAuth } = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth, allowRoles('admin', 'librarian'));

router.get('/', async (req, res) => {
  const filter = ['issued', 'returned'].includes(req.query.status) ? { status: req.query.status } : {};
  const issues = await Issue.find(filter)
    .populate('book', 'title author isbn')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json(issues);
});

router.post('/', async (req, res) => {
  const { bookId, borrower, dueDate } = req.body;
  if (!bookId || typeof borrower !== 'string' || !borrower.trim()) {
    return res.status(400).json({ message: 'Choose a book and enter the borrower name.' });
  }
  const parsedDueDate = new Date(dueDate);
  if (!dueDate || Number.isNaN(parsedDueDate.getTime()) || parsedDueDate <= new Date()) {
    return res.status(400).json({ message: 'Due date must be a valid future date.' });
  }

  const book = await Book.findOneAndUpdate(
    { _id: bookId, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } },
    { new: true }
  );
  if (!book) {
    const exists = await Book.exists({ _id: bookId });
    return res.status(exists ? 409 : 404).json({
      message: exists ? 'There are no available copies of this book.' : 'Book not found.'
    });
  }

  try {
    const issue = await Issue.create({ book: book.id, borrower: borrower.trim(), dueDate: parsedDueDate });
    await issue.populate('book', 'title author isbn');
    res.status(201).json(issue);
  } catch (error) {
    await Book.updateOne({ _id: book.id }, { $inc: { availableCopies: 1 } });
    throw error;
  }
});

router.patch('/:id/return', async (req, res) => {
  const issue = await Issue.findOneAndUpdate(
    { _id: req.params.id, status: 'issued' },
    { $set: { status: 'returned', returnedAt: new Date() } },
    { new: true }
  );
  if (!issue) {
    const exists = await Issue.exists({ _id: req.params.id });
    return res.status(exists ? 409 : 404).json({
      message: exists ? 'This book has already been returned.' : 'Issue not found.'
    });
  }

  const book = await Book.findByIdAndUpdate(issue.book, { $inc: { availableCopies: 1 } }, { new: true });
  if (!book) {
    await Issue.updateOne({ _id: issue.id, status: 'returned' }, { $set: { status: 'issued', returnedAt: null } });
    return res.status(409).json({ message: 'The book record is missing; the issue was not returned.' });
  }
  await issue.populate('book', 'title author isbn');
  res.json(issue);
});

module.exports = router;
