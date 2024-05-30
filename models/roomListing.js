const mongoose = require('mongoose');

// Define schema for room listings
const roomListingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['single-room', 'double-room'], required: true },
  location: { type: String, required: true },
  ac: { type: Boolean, required: true },
  price: { type: Number, required: true },
  availability: { type: String, enum: ['available', 'unavailable'], required: true },
  amenities: { type: [String], required: true },
  image: { type: String, required: true },
  buildingNumber: { type: Number },
  roomNumber: { type: String, required: true },
  rentPerDay: { type: Number },
  createdAt: { type: Date, default: Date.now },
});



// Create model from schema
const RoomListing = mongoose.model('RoomListing', roomListingSchema);

module.exports = RoomListing;