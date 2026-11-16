const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Helper function to normalize user fields safely (prevents 'undefined')
function formatUserDoc(u) {
  const doc = u.toObject ? u.toObject() : { ...u };
  return {
    ...doc,
    universityRoll: doc.universityRoll || doc.rollNumber || '',
    stream: doc.stream || doc.department || '',
    semester: doc.semester || '',
    phone: doc.phone || '',
    status: doc.status || 'Active'
  };
}

// GET /api/users (All users অথবা ?role=student বা ?role=librarian দিয়ে ফিল্টার)
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users.map(formatUserDoc));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
  }
});

// GET /api/users/students (All Registered Students)
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(students.map(formatUserDoc));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students.', error: error.message });
  }
});

// GET /api/users/librarians (All Librarians List)
router.get('/librarians', async (req, res) => {
  try {
    const librarians = await User.find({ role: 'librarian' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(librarians.map(formatUserDoc));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch librarians.', error: error.message });
  }
});

// POST /api/users (Admin প্যানেল থেকে নতুন Student বা Librarian তৈরি করার জন্য)
router.post(['/', '/add'], async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      universityRoll,
      stream,
      semester,
      phone,
      status
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const newUserPayload = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'student',
      universityRoll: universityRoll ? universityRoll.trim() : '',
      rollNumber: universityRoll ? universityRoll.trim() : '',
      stream: stream ? stream.trim() : '',
      department: stream ? stream.trim() : '',
      semester: semester ? semester.trim() : '',
      phone: phone ? phone.trim() : '',
      status: status || 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let savedUser;
    try {
      const userDoc = new User(newUserPayload);
      savedUser = await userDoc.save();
    } catch (e) {
      const inserted = await User.collection.insertOne(newUserPayload);
      savedUser = { _id: inserted.insertedId, ...newUserPayload };
    }

    const userResponse = formatUserDoc(savedUser);
    delete userResponse.password;

    res.status(201).json({
      message: `${(role || 'User').toUpperCase()} "${name.trim()}" created successfully!`,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user.', error: error.message });
  }
});

// PUT /api/users/:id (Edit Student / Librarian Details + Active / Deactive Status)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const { name, email, universityRoll, stream, semester, phone, status, password } = req.body;

    const updateFields = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateFields.name = name.trim();
    if (email !== undefined) updateFields.email = email.trim().toLowerCase();
    if (universityRoll !== undefined) {
      updateFields.universityRoll = universityRoll.trim();
      updateFields.rollNumber = universityRoll.trim();
    }
    if (stream !== undefined) {
      updateFields.stream = stream.trim();
      updateFields.department = stream.trim();
    }
    if (semester !== undefined) updateFields.semester = semester.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (status !== undefined) updateFields.status = status;

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password.trim(), salt);
    }

    await User.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateFields }
    );

    const updatedUser = await User.findById(id).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: `"${updatedUser.name}" updated successfully!`,
      user: formatUserDoc(updatedUser)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user.', error: error.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user.', error: error.message });
  }
});

module.exports = router;