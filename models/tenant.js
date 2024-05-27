const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
  name: { type: String },
  dob: { type: String },
  age: { type: Number },
  mobileNumber: { type: String },
  whatsappNumber: { type: String },
  aadharNumber: { type: String },
  email: { type: String },
  address: { type: String },
  fathersName: { type: String },
  fathersOccupation: { type: String },
  fathersContactNumber: { type: String },
  homePhone: { type: String },
  mothersName: { type: String },
  siblingName: { type: String },
  propertyDealer: { type: String },
  durationOfStay: { type: String },
  dealersContactNumber: { type: String },
  policeStationHomeTown: { type: String },
  buildingNumber: { type: String },
  roomNumber: { type: String },
  rentPerDayXDays: { type: String },
  rentPerMonth: { type: String },
  roomUnit: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contactTable: [
    {
      type: { type: String },
      name: { type: String },
      contactNumber: { type: String },
      relation: { type: String },
      _id: false,
    },
  ],
  paymentInformation: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

const FormData = mongoose.model('FormData', formDataSchema);
module.exports = FormData;