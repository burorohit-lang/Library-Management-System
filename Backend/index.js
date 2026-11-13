require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { seedAdmin } = require('./src/services/auth');
const authRoutes = require('./src/routes/auth');
const bookRoutes = require('./src/routes/books');
const issueRoutes = require('./src/routes/issues');
const dashboardRoutes = require('./src/routes/dashboard');
const userRoutes = require('./src/routes/users');

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', dashboardRoutes);
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found.' }));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with that email or ISBN already exists.' });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }
  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

async function start() {
  const { MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI) throw new Error('MONGODB_URI is required in Backend/.env.');
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('Set JWT_SECRET to a random value of at least 32 characters in Backend/.env.');
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in Backend/.env to create the initial admin account.');
  }

  await mongoose.connect(MONGODB_URI);
  await seedAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);
  app.listen(port, () => console.log(`Library API listening on http://localhost:${port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error(`Could not start the library API: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = app;