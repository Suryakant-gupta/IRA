const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceRequestSchema = new Schema({
  requestType: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  buildingNumber: {
    type: String,
    required: true
  },
  requestNumber: {
    type: String,
    required: true
  },
  formData: {
    type: Schema.Types.ObjectId,
    ref: 'tenant',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: { type: String, default: 'open' },
  // room: { type: mongoose.Schema.Types.ObjectId, ref: 'roomListing' },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);