const express = require('express');
const Book = require('../models/Book');
const Issue = require('../models/Issue');
const { allowRoles, requireAuth } = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth, allowRoles('admin', 'librarian'));

router.get('/stats', async (req, res) => {
  const [bookTotals, activeIssues, overdueIssues, totalUsers, recentIssues] = await Promise.all([
    Book.aggregate([{
      $group: {
        _id: null,
        titles: { $sum: 1 },
        totalCopies: { $sum: '$totalCopies' },
        availableCopies: { $sum: '$availableCopies' }
      }
    }]),
    Issue.countDocuments({ status: 'issued' }),
    Issue.countDocuments({ status: 'issued', dueDate: { $lt: new Date() } }),
    require('../models/User').countDocuments({ role: { $in: ['student', 'librarian'] } }),
    Issue.find().populate('book', 'title author').sort({ createdAt: -1 }).limit(5).lean()
  ]);
  res.json({
    ...(bookTotals[0] || { titles: 0, totalCopies: 0, availableCopies: 0 }),
    activeIssues,
    overdueIssues,
    totalUsers,
    recentIssues
  });
});

router.get('/', async (req, res) => {
  const categories = await Book.aggregate([
    { $group: { _id: '$category', titleCount: { $sum: 1 }, copies: { $sum: '$totalCopies' } } },
    { $sort: { _id: 1 } }
  ]);
  res.json(categories.map(({ _id, ...category }) => ({ name: _id, ...category })));
});

module.exports = router;
