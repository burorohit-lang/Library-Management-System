const express = require('express');
const User = require('../models/User');
const { createToken, hashPassword, verifyPassword } = require('../services/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const role = String(req.body.role || '');
  if (!email || !password || !['admin', 'librarian'].includes(role)) {
    return res.status(400).json({ message: 'Enter your email and password and choose Admin or Librarian.' });
  }

  const user = await User.findOne({ email, role }).select('+passwordHash');
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ message: 'The email or password is incorrect.' });
  }

  res.json({
    token: createToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

router.post('/register-student', async (req, res) => {
  const { name, email, password } = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await hashPassword(password),
    role: 'student'
  });
  res.status(201).json({ message: 'Student account created.', id: user.id });
});

module.exports = router;
