const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['manager', 'admin'], default: 'manager' },
  createdAt: { type: Date, default: Date.now }
});

const AdminUser = mongoose.model('AdminUser', adminUserSchema);

module.exports = AdminUser;