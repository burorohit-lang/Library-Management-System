const express = require('express');
const Book = require('../models/Book');
const Issue = require('../models/Issue');
const { allowRoles, requireAuth } = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth, allowRoles('admin', 'librarian'));

router.get('/', async (req, res) => {
  const search = String(req.query.search || '').trim();
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = escaped
    ? { $or: ['title', 'author', 'isbn', 'category'].map((field) => ({ [field]: { $regex: escaped, $options: 'i' } })) }
    : {};
  res.json(await Book.find(filter).sort({ updatedAt: -1 }).lean());
});

router.post('/', async (req, res) => {
  const { title, author, isbn, category } = req.body;
  const totalCopies = Number(req.body.totalCopies);
  if (!Number.isInteger(totalCopies) || totalCopies < 1) {
    return res.status(400).json({ message: 'Total copies must be a whole number greater than zero.' });
  }
  const book = await Book.create({ title, author, isbn, category, totalCopies, availableCopies: totalCopies });
  res.status(201).json(book);
});

router.patch('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found.' });

  for (const field of ['title', 'author', 'isbn', 'category']) {
    if (req.body[field] !== undefined) book[field] = req.body[field];
  }
  if (req.body.totalCopies !== undefined) {
    const totalCopies = Number(req.body.totalCopies);
    const issuedCopies = book.totalCopies - book.availableCopies;
    if (!Number.isInteger(totalCopies) || totalCopies < Math.max(1, issuedCopies)) {
      return res.status(400).json({ message: `Total copies cannot be less than the ${issuedCopies} copies currently on loan.` });
    }
    book.totalCopies = totalCopies;
    book.availableCopies = totalCopies - issuedCopies;
  }
  await book.save();
  res.json(book);
});

router.delete('/:id', async (req, res) => {
  const activeIssue = await Issue.exists({ book: req.params.id, status: 'issued' });
  if (activeIssue) return res.status(409).json({ message: 'Return all copies before deleting this book.' });
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  res.status(204).end();
});

module.exports = router;
