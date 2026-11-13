const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: 'N/A' },
  department: { type: String, default: 'General' },
  role: { type: String, enum: ['student', 'librarian', 'admin'], default: 'student' },
  shift: { type: String, default: 'Morning (09:00 AM - 05:00 PM)' },
  status: { type: String, enum: ['Active', 'Deactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
