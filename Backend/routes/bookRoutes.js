const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/Book');

// Get all books (GET /api/books)
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
});

// Add a new book (POST /api/books)
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies, shelfLocation, location } = req.body;

    if (!title || !title.trim() || !author || !author.trim() || !category || !category.trim()) {
      return res.status(400).json({ message: 'Book Title, Author, and Category are required!' });
    }

    const copies = Math.max(1, Number(totalCopies) || 1);
    const finalShelf = (shelfLocation ?? location ?? '').trim();

    const newBook = new Book({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn?.trim() || 'N/A',
      category: category.trim(),
      totalCopies: copies,
      availableCopies: copies,
      shelfLocation: finalShelf
    });

    const saved = await newBook.save();
    res.status(201).json({
      message: `Book "${saved.title}" added to catalog successfully!`,
      book: saved
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add book', error: error.message });
  }
});

// Update book details & increase stock (PUT /api/books/:id)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid book ID format.' });
    }

    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found in database.' });
    }

    const { title, author, isbn, category, totalCopies, availableCopies, shelfLocation, location } = req.body;

    const currentlyIssued = (existingBook.totalCopies || 0) - (existingBook.availableCopies || 0);
    const parsedTotal = totalCopies !== undefined ? Number(totalCopies) : existingBook.totalCopies;

    if (isNaN(parsedTotal) || parsedTotal < 1) {
      return res.status(400).json({ message: 'Total copies must be at least 1.' });
    }

    if (parsedTotal < currentlyIssued) {
      return res.status(400).json({
        message: `Total copies (${parsedTotal}) cannot be less than currently issued books (${currentlyIssued}).`
      });
    }

    const parsedAvailable =
      availableCopies !== undefined ? Number(availableCopies) : parsedTotal - currentlyIssued;

    const updatedShelf =
      shelfLocation !== undefined
        ? shelfLocation.trim()
        : location !== undefined
        ? location.trim()
        : existingBook.shelfLocation;

    existingBook.title = title ? title.trim() : existingBook.title;
    existingBook.author = author ? author.trim() : existingBook.author;
    existingBook.isbn = isbn ? isbn.trim() : existingBook.isbn;
    existingBook.category = category ? category.trim() : existingBook.category;
    existingBook.shelfLocation = updatedShelf;
    existingBook.totalCopies = parsedTotal;
    existingBook.availableCopies = parsedAvailable;

    const updatedBook = await existingBook.save();

    res.status(200).json({
      message: `Book "${updatedBook.title}" updated successfully!`,
      book: updatedBook
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
});

// Delete a book (DELETE /api/books/:id)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid book ID format.' });
    }

    const bookToDelete = await Book.findById(id);
    if (!bookToDelete) {
      return res.status(404).json({ message: 'Book not found in database.' });
    }

    const currentlyIssued = (bookToDelete.totalCopies || 0) - (bookToDelete.availableCopies || 0);
    if (currentlyIssued > 0) {
      return res.status(400).json({
        message: `Cannot delete "${bookToDelete.title}" because ${currentlyIssued} copy/copies are currently issued.`
      });
    }

    await Book.findByIdAndDelete(id);
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
});

module.exports = router;