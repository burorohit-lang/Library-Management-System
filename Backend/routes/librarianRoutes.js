const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Issue = require('../models/Issue');
const SystemConfig = require('../models/SystemConfig');

router.get('/dashboard', async (req, res) => {
  try {
    const config = await SystemConfig.findOne();
    const finePerDay = config?.finePerDay ?? 10;
    const books = await Book.find();
    const totalAvailableBooks = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);
    const activeIssuesCount = await Issue.countDocuments({ status: { $in: ['Active', 'Overdue'] } });
    const pendingRequestsCount = await Issue.countDocuments({ status: 'Pending' });
    const overdueCount = await Issue.countDocuments({ status: 'Overdue' });
    const allIssues = await Issue.find();
    const totalFines = allIssues.reduce((sum, item) => sum + (item.fine || 0), 0);
    const recentTransactions = await Issue.find().sort({ createdAt: -1 }).limit(6);

    res.status(200).json({
      finePerDay,
      stats: { totalAvailableBooks, activeIssuesCount, pendingRequestsCount, overdueCount, totalFines },
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load librarian dashboard', error: error.message });
  }
});

module.exports = router;
