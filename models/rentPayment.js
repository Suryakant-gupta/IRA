const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rentPaymentSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomListing',
    required: true
  },
  electricityBill: {
    type: Number,
    required: true
  },
  waterBill: {
    type: Number,
    required: true
  },
  roomRent: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RentPayment = mongoose.model('RentPayment', rentPaymentSchema);
module.exports = RentPayment;