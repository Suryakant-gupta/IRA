const mongoose = require('mongoose');

const vacateRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomNumber: { type: String, required: true },
  buildingNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const VacateRequest = mongoose.model('VacateRequest', vacateRequestSchema);

module.exports = VacateRequest;