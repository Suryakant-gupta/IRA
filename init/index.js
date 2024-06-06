const mongoose = require("mongoose");
const initdata = require("./roomListings.js");
const Listing = require("../models/roomListing.js");

// mongoconnection link so that we can use it as variable instead of writing whole link
const MONGO_URL = "mongodb://iraUser:IralivingDB%402604@93.127.195.9:27017/admin";

// making connection with mongodb and checking if any error occurred
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to the DB");

  // Call the initDB function after the connection is established
  await initDB();
}

const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initdata.roomListings);
  console.log("Data was initialized");
};

main().catch((err) => {
  console.log(err);
});