const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const Issue = require('../models/Issue');
const SystemConfig = require('../models/SystemConfig');

// স্টুডেন্ট ড্যাশবোর্ডের সব ডেটা লোড করা (Active, Pending, Rejected ও Catalog)
router.get('/student-dashboard', async (req, res) => {
  try {
    const { email, studentId } = req.query;
    let student = null;
    if (studentId && studentId !== 'demo_student_id' && studentId.length === 24) {
      student = await User.findById(studentId).select('-password');
    }
    if (!student && email) {
      student = await User.findOne({ email: email.toLowerCase().trim() }).select('-password');
    }

    const targetEmail = student?.email || email?.toLowerCase().trim();
    const config = await SystemConfig.findOne();
    const finePerDay = config?.finePerDay ?? 10;

    // স্টুডেন্টের ইস্যু করা বই (Active, Overdue, Pending, Rejected)
    const rawIssues = targetEmail
      ? await Issue.find({
          studentEmail: { $regex: new RegExp(`^${targetEmail}$`, 'i') },
          status: { $in: ['Active', 'Overdue', 'Pending', 'Rejected'] }
        }).sort({ createdAt: -1 })
      : [];

    const today = new Date();
    const issuedBooks = await Promise.all(
      rawIssues.map(async (item) => {
        const bookDetails = await Book.findOne({ title: { $regex: new RegExp(`^${item.bookTitle}$`, 'i') } });
        let currentFine = item.fine || 0;
        let currentStatus = item.status;

        if (item.status === 'Active' || item.status === 'Overdue') {
          const due = new Date(item.dueDate);
          if (today > due) {
            const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
            currentFine = diffDays * finePerDay;
            currentStatus = 'Overdue';
          }
        }

        return {
          _id: item._id,
          title: item.bookTitle,
          author: bookDetails?.author || 'Library Edition',
          issueDate: item.issueDate,
          dueDate: item.dueDate,
          fine: currentFine,
          status: currentStatus
        };
      })
    );

    const allBooks = await Book.find().sort({ title: 1 });
    const availableBooks = allBooks.map((book) => ({
      _id: book._id,
      title: book.title,
      author: book.author,
      category: book.category,
      location: book.shelfLocation || 'Main Rack',
      availableCopies: book.availableCopies,
      totalCopies: book.totalCopies
    }));

    res.status(200).json({ student, issuedBooks, availableBooks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load student dashboard', error: error.message });
  }
});

// স্টুডেন্ট নিজে থেকে বই ইস্যুর রিকোয়েস্ট পাঠাবে (Librarian-এর কাছে যাবে)
router.post('/request-book', async (req, res) => {
  try {
    const { studentName, studentEmail, bookTitle, requestedDays } = req.body;

    if (!studentEmail || !bookTitle) {
      return res.status(400).json({ message: 'Student email and book title are required.' });
    }

    const cleanEmail = studentEmail.toLowerCase().trim();
    const cleanTitle = bookTitle.trim();

    const student = await User.findOne({ email: cleanEmail, role: 'student' });
    if (student && student.status === 'Deactive') {
      return res.status(403).json({ message: 'Your account is deactivated. Contact the administrator.' });
    }

    // বই স্টকে আছে কিনা চেক করা
    const book = await Book.findOne({ title: { $regex: new RegExp(`^${cleanTitle}$`, 'i') } });
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Sorry, this book is currently out of stock.' });
    }

    // একই বইয়ের জন্য আগে থেকেই Pending বা Active রিকোয়েস্ট আছে কিনা চেক
    const duplicate = await Issue.findOne({
      studentEmail: cleanEmail,
      bookTitle: book.title,
      status: { $in: ['Pending', 'Active', 'Overdue'] }
    });
    if (duplicate) {
      return res.status(400).json({
        message: `You already have a ${duplicate.status.toLowerCase()} request/issue for "${book.title}".`
      });
    }

    // সর্বোচ্চ বই নেওয়ার লিমিট চেক করা
    const config = await SystemConfig.findOne();
    const maxBooks = config?.maxBooksPerStudent ?? 3;
    const totalActiveOrPending = await Issue.countDocuments({
      studentEmail: cleanEmail,
      status: { $in: ['Pending', 'Active', 'Overdue'] }
    });

    if (totalActiveOrPending >= maxBooks) {
      return res.status(400).json({
        message: `You have reached the maximum limit of ${maxBooks} books (including pending requests).`
      });
    }

    const days = Number(requestedDays) || 14;
    const todayStr = new Date().toISOString().split('T')[0];
    const dueStr = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newRequest = new Issue({
      studentName: student?.name || studentName || 'Student Member',
      studentEmail: cleanEmail,
      bookTitle: book.title,
      issueDate: todayStr,
      dueDate: dueStr,
      fine: 0,
      status: 'Pending'
    });

    const saved = await newRequest.save();
    res.status(201).json({
      message: `Request sent to Librarian for "${book.title}"!`,
      request: saved
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit book request', error: error.message });
  }
});

module.exports = router;
