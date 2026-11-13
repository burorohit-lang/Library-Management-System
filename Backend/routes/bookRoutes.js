const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies, shelfLocation } = req.body;
    const copies = Number(totalCopies) || 1;
    const newBook = new Book({
      title,
      author,
      isbn: isbn || 'N/A',
      category,
      totalCopies: copies,
      availableCopies: copies,
      shelfLocation: shelfLocation || 'Main Rack'
    });
    const saved = await newBook.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add book', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
});

module.exports = router;
