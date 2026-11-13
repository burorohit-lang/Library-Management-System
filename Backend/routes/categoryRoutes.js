const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (exists) return res.status(400).json({ message: 'This category already exists!' });
    const newCat = new Category({ name: name.trim(), type: type || 'Academic', description: description?.trim() || 'No description provided' });
    const saved = await newCat.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add category', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
});

module.exports = router;
