const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  libraryName: { type: String, default: 'Central Library Portal' },
  maxBooksPerStudent: { type: Number, default: 3 },
  finePerDay: { type: Number, default: 10 },
  allowStudentRegistration: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
