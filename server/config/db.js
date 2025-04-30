const mongoose = require("mongoose");

// ----------------------------------------------
// Connect to MongoDB using Mongoose
// Uses connection string from environment variables
// ----------------------------------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Load URI from .env
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit process on connection failure
  }
};

module.exports = connectDB;