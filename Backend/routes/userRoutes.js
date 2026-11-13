const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Add User (Student or Librarian)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, shift } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: `A ${existing.role} with this email already exists!` });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'student',
      shift: role === 'librarian' ? shift : undefined,
      status: 'Active'
    });
    const saved = await newUser.save();
    const obj = saved.toObject();
    delete obj.password;
    res.status(201).json({ message: 'User account created successfully!', user: obj });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// Get All Students
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load students', error: error.message });
  }
});

// Get All Librarians
router.get('/librarians', async (req, res) => {
  try {
    const librarians = await User.find({ role: 'librarian' }).select('-password').sort({ createdAt: -1 });
    const formatted = librarians.map((lib) => ({
      _id: lib._id,
      name: lib.name,
      email: lib.email,
      shift: lib.shift || 'Morning (09:00 AM - 05:00 PM)',
      joinedDate: new Date(lib.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: lib.status || 'Active',
      isDefault: lib.email === 'librarian@library.com'
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load librarians', error: error.message });
  }
});

// Edit Student
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, department } = req.body;
    const updated = await User.findByIdAndUpdate(req.params.id, { name, email, phone, department }, { new: true }).select('-password');
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Toggle Status
router.patch('/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = user.status === 'Active' ? 'Deactive' : 'Active';
    await user.save();
    const obj = user.toObject();
    delete obj.password;
    res.status(200).json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle status', error: error.message });
  }
});

// Delete Librarian
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.email === 'librarian@library.com') return res.status(403).json({ message: 'Cannot delete primary librarian' });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

module.exports = router;