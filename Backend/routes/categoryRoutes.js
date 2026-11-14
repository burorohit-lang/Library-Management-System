const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// সব ক্যাটাগরি লোড করা
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories', error: error.message });
  }
});

// নতুন ম্যানুয়াল ক্যাটাগরি ও কাস্টম Category Type যোগ করা
router.post('/', async (req, res) => {
  try {
    const { name, type, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required!' });
    }
    if (!type || !type.trim()) {
      return res.status(400).json({ message: 'Category type is required!' });
    }

    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (exists) {
      return res.status(400).json({ message: 'This category already exists!' });
    }

    const newCat = new Category({
      name: name.trim(),
      type: type.trim(),
      description: description?.trim() || 'No description provided'
    });

    const saved = await newCat.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add category', error: error.message });
  }
});

// ক্যাটাগরি ডিলিট করা
router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
});

module.exports = router;
