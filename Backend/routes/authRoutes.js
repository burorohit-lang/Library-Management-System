const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SystemConfig = require('../models/SystemConfig');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'library_management_secret_key_2026';
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      if (role === 'admin' && normalizedEmail === 'admin@library.com' && password === 'adminpassword123') {
        const token = jwt.sign(
          { id: 'master-admin', email: normalizedEmail, role: 'admin' },
          getJwtSecret(),
          { expiresIn: '1d' }
        );
        return res.status(200).json({
          token,
          user: { _id: 'master-admin', name: 'System Admin', email: normalizedEmail, role: 'admin' },
        });
      }
      if (role === 'librarian' && normalizedEmail === 'librarian@library.com' && password === 'librarianpassword123') {
        const token = jwt.sign(
          { id: 'master-librarian', email: normalizedEmail, role: 'librarian' },
          getJwtSecret(),
          { expiresIn: '1d' }
        );
        return res.status(200).json({
          token,
          user: { _id: 'master-librarian', name: 'Head Librarian', email: normalizedEmail, role: 'librarian' },
        });
      }
      return res.status(401).json({ message: 'Account not found! Please register first.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This email is registered as a ${user.role}, not a ${role}.` });
    }
    if (user.status === 'Deactive') {
      return res.status(403).json({ message: 'Your account has been deactivated by the Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password!' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        universityRoll: user.universityRoll || '',
        stream: user.stream || user.department || '',
        semester: user.semester || '',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login server error', error: error.message });
  }
});

// POST /api/auth/register (also aliased to /signup)
router.post(['/register', '/signup'], async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      universityRoll,
      rollNumber,
      stream,
      department,
      semester
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const finalRoll = String(universityRoll || rollNumber || '').trim();
    if (!finalRoll) {
      return res.status(400).json({ message: 'University Roll Number is required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const config = await SystemConfig.findOne();
    if (config && config.allowStudentRegistration === false) {
      return res.status(403).json({ message: 'Student self-registration is currently disabled.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: 'This email is already registered!' });
    }

    // Check duplicate University Roll Number
    const existingRoll = await User.findOne({
      role: 'student',
      universityRoll: finalRoll
    });
    if (existingRoll) {
      return res.status(409).json({
        message: `University Roll Number "${finalRoll}" is already registered!`
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const resolvedStream = String(stream || department || '').trim();

    const newStudent = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      universityRoll: finalRoll,
      stream: resolvedStream,
      department: resolvedStream || 'General',
      semester: String(semester || '').trim(),
      role: 'student',
      status: 'Active',
    });

    await newStudent.save();
    res.status(201).json({
      message: 'Registration successful! Redirecting to login...',
      user: {
        _id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email,
        universityRoll: newStudent.universityRoll,
        stream: newStudent.stream,
        semester: newStudent.semester,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// POST /api/auth/change-password (For logged-in Student, Librarian & Admin)
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized. Please log in again.' });
    }

    const decoded = jwt.verify(authHeader.split(' ')[1], getJwtSecret());

    if (decoded.id === 'master-admin' || decoded.id === 'master-librarian') {
      return res.status(403).json({ message: 'Default Master account password cannot be changed here.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect!' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email!' });
    }
    if (user.email === 'admin@library.com') {
      return res.status(403).json({ message: 'Master Admin password cannot be reset here.' });
    }

    const resetToken = jwt.sign(
      { email: user.email, purpose: 'password-reset' },
      getJwtSecret(),
      { expiresIn: '15m' }
    );

    res.status(200).json({
      message: 'Account verified! Enter new password below.',
      verified: true,
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body || {};
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    if (resetToken) {
      const payload = jwt.verify(resetToken, getJwtSecret());
      if (payload.purpose !== 'password-reset' || payload.email !== String(email).toLowerCase().trim()) {
        return res.status(401).json({ message: 'Invalid or expired reset session.' });
      }
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    if (user.email === 'admin@library.com') {
      return res.status(403).json({ message: 'Master Admin password cannot be reset here.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successful!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// GET /api/auth/verify-session (also aliased to /me)
router.get(['/verify-session', '/me'], async (req, res) => {
  try {
    const config = await SystemConfig.findOne();
    const maintenanceMode = config?.maintenanceMode || false;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(200).json({ authenticated: false, maintenanceMode });
    }

    const decoded = jwt.verify(authHeader.split(' ')[1], getJwtSecret());
    res.status(200).json({ authenticated: true, user: decoded, maintenanceMode });
  } catch (error) {
    res.status(200).json({ authenticated: false, maintenanceMode: false });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully.' });
});

module.exports = router;