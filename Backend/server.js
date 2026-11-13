const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// সবগুলো রাউট ফাইল ইম্পোর্ট করা
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const librarianRoutes = require('./routes/librarianRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const issueRoutes = require('./routes/issueRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const studentLibraryRoutes = require('./routes/studentLibraryRoutes');

const app = express();

// মিডলওয়্যার (Middleware) - Allowed Origins Updated for Vercel & Localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://libary-admin-git-main-buro7.vercel.app',
  process.env.FRONTEND_URL // Optional environment variable on Render
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation: This origin is not allowed.'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB ডাটাবেস কানেকশন
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library_management_db';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// হেলথ চেক রুট (সার্ভার চালু আছে কিনা দেখার জন্য)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Library Management System API is running smoothly!'
  });
});

// API রাউট মাউন্টিং (ফ্রন্টএন্ডের সব API কলের সাথে হুবহু মিল রেখে)
app.use('/api/auth', authRoutes);                 // Login, Register, Forgot/Reset Password, Session Check
app.use('/api/admin', adminRoutes);               // Overview, Analytics, Admin Profile, System Config
app.use('/api/librarian', librarianRoutes);       // Librarian Dashboard Stats & Logs
app.use('/api/users', userRoutes);                // Add User, Students List, Librarians List, Edit/Delete
app.use('/api/books', bookRoutes);                // Add Book, Book List, Search, Delete
app.use('/api/issues', issueRoutes);              // Active Issues, Issue Book, Extend Due Date, Return, History
app.use('/api/categories', categoryRoutes);       // Manual Category Management
app.use('/api/library', studentLibraryRoutes);    // Student Dashboard (Issued Books, Fine, Catalog Search)

// ৪-০-৪ (404) রাউট হ্যান্ডলার
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found on this server.` });
});

// গ্লোবাল এরর হ্যান্ডলার
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message
  });
});

// সার্ভার চালু করা
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});