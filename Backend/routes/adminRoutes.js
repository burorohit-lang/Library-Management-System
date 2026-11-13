const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Book = require('../models/Book');
const Issue = require('../models/Issue');
const SystemConfig = require('../models/SystemConfig');

router.get('/overview', async (req, res) => {
  try {
    const books = await Book.find();
    const totalTitles = books.length;
    const totalCopies = books.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
    const availableCopies = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalLibrarians = await User.countDocuments({ role: 'librarian' });
    const activeIssuesCount = await Issue.countDocuments({ status: 'Active' });
    const overdueIssuesCount = await Issue.countDocuments({ status: 'Overdue' });
    const allIssues = await Issue.find();
    const totalFines = allIssues.reduce((sum, item) => sum + (item.fine || 0), 0);
    const recentIssues = await Issue.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      stats: { totalTitles, totalCopies, availableCopies, totalStudents, totalLibrarians, activeIssuesCount, overdueIssuesCount, totalFines },
      recentIssues
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load overview', error: error.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const { period = 'this_month' } = req.query;
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    if (period === 'last_quarter') startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    else if (period === 'this_year') startDate = new Date(now.getFullYear(), 0, 1);

    const periodIssues = await Issue.find({ createdAt: { $gte: startDate } });
    const activeReaders = await User.countDocuments({ role: 'student' });
    const totalAllIssues = await Issue.countDocuments();
    const returnedIssues = await Issue.countDocuments({ status: 'Returned' });
    const returnRate = totalAllIssues > 0 ? ((returnedIssues / totalAllIssues) * 100).toFixed(1) : '100.0';
    const totalBooksCount = await Book.countDocuments();

    const categoryAgg = await Book.aggregate([
      { $group: { _id: '$category', totalBooks: { $sum: '$totalCopies' }, availableBooks: { $sum: '$availableCopies' } } },
      { $sort: { totalBooks: -1 } },
      { $limit: 4 }
    ]);

    const categoryStats = categoryAgg.map((cat) => {
      const borrowed = cat.totalBooks - cat.availableBooks;
      const percentage = cat.totalBooks > 0 ? Math.min(100, Math.max(15, Math.round((borrowed / cat.totalBooks) * 100) || 50)) : 0;
      return { name: cat._id || 'General', percentage, booksCount: `${cat.totalBooks} Books` };
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const allIssues = await Issue.find();
    const monthlyTrends = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIndex = d.getMonth();
      const yVal = d.getFullYear();

      const monthBorrows = allIssues.filter((item) => {
        const dt = new Date(item.issueDate || item.createdAt);
        return dt.getMonth() === mIndex && dt.getFullYear() === yVal;
      }).length;

      const monthReturns = allIssues.filter((item) => {
        if (item.status !== 'Returned') return false;
        const dt = new Date(item.returnDate || item.updatedAt);
        return dt.getMonth() === mIndex && dt.getFullYear() === yVal;
      }).length;

      monthlyTrends.push({
        month: monthNames[mIndex],
        borrowHeight: Math.min(100, Math.max(15, monthBorrows * 15)),
        returnHeight: Math.min(100, Math.max(10, monthReturns * 15)),
        borrowCount: monthBorrows,
        returnCount: monthReturns
      });
    }

    res.status(200).json({
      metrics: [
        { title: 'Period Circulation', value: periodIssues.length.toLocaleString(), change: '+14.2%', isPositive: true, key: 'circulation' },
        { title: 'Active Readers', value: activeReaders.toLocaleString(), change: '+8.1%', isPositive: true, key: 'readers' },
        { title: 'Book Return Rate', value: `${returnRate}%`, change: '+2.4%', isPositive: true, key: 'return' },
        { title: 'Catalog Titles', value: totalBooksCount.toLocaleString(), change: '+4.5%', isPositive: true, key: 'growth' }
      ],
      categoryStats,
      monthlyTrends
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load analytics', error: error.message });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const email = req.query.email || 'admin@library.com';
    const admin = await User.findOne({ email, role: 'admin' }).select('-password');
    res.status(200).json({ name: admin?.name || 'System Administrator', email, role: 'Super Admin' });
  } catch (error) {
    res.status(500).json({ message: 'Error loading profile', error: error.message });
  }
});

router.put('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const admin = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin account not found in database!' });
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect!' });
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();
    res.status(200).json({ message: 'Admin password updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
});

router.get('/config', async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) config = await SystemConfig.create({});
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load config', error: error.message });
  }
});

router.put('/config', async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) config = new SystemConfig();
    Object.assign(config, req.body);
    const updated = await config.save();
    res.status(200).json({ message: 'System configurations updated!', config: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save config', error: error.message });
  }
});

module.exports = router;
