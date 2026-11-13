const express = require('express');
const User = require('../models/User');
const { hashPassword } = require('../services/auth');
const { allowRoles, requireAuth } = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth, allowRoles('admin'));

router.get('/', async (req, res) => {
  const filter = ['student', 'librarian'].includes(req.query.role) ? { role: req.query.role } : {};
  const users = await User.find(filter).select('name email role createdAt').sort({ name: 1 }).lean();
  res.json(users);
});

router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }
  if (!['student', 'librarian'].includes(role)) {
    return res.status(400).json({ message: 'Choose a student or librarian role.' });
  }

  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await hashPassword(password),
    role
  });
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

module.exports = router;
