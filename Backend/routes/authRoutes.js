const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SystemConfig = require('../models/SystemConfig');

const JWT_SECRET = process.env.JWT_SECRET || 'library_management_secret_key_2026';

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password.' });
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      if (role === 'admin' && normalizedEmail === 'admin@library.com' && password === 'adminpassword123') {
        const token = jwt.sign({ email: normalizedEmail, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
        return res.status(200).json({ token, user: { _id: 'master-admin', name: 'System Admin', email: normalizedEmail, role: 'admin' } });
      }
      if (role === 'librarian' && normalizedEmail === 'librarian@library.com' && password === 'librarianpassword123') {
        const token = jwt.sign({ email: normalizedEmail, role: 'librarian' }, JWT_SECRET, { expiresIn: '1d' });
        return res.status(200).json({ token, user: { _id: 'master-librarian', name: 'Head Librarian', email: normalizedEmail, role: 'librarian' } });
      }
      return res.status(401).json({ message: 'Account not found! Please register first.' });
    }

    if (role && user.role !== role) return res.status(403).json({ message: `This email is registered as a ${user.role}, not a ${role}.` });
    if (user.status === 'Deactive') return res.status(403).json({ message: 'Your account has been deactivated by the Admin.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password!' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Login server error', error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    const config = await SystemConfig.findOne();
    if (config && config.allowStudentRegistration === false) {
      return res.status(403).json({ message: 'Student self-registration is currently disabled.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ message: 'This email is already registered!' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newStudent = new User({ name: name.trim(), email: normalizedEmail, password: hashedPassword, department: department || 'Computer Science', role: 'student', status: 'Active' });
    await newStudent.save();
    res.status(201).json({ message: 'Registration successful! Redirecting to login...' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'No account found with this email!' });
    if (user.email === 'admin@library.com') return res.status(403).json({ message: 'Master Admin password cannot be reset here.' });
    res.status(200).json({ message: 'Account verified! Enter new password below.', verified: true });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found!' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({ message: 'Password reset successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

router.get('/verify-session', async (req, res) => {
  try {
    const config = await SystemConfig.findOne();
    const maintenanceMode = config?.maintenanceMode || false;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(200).json({ authenticated: false, maintenanceMode });
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    res.status(200).json({ authenticated: true, user: decoded, maintenanceMode });
  } catch (error) {
    res.status(200).json({ authenticated: false, maintenanceMode: false });
  }
});

module.exports = router;
