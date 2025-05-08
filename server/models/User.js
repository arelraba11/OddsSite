// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true // Removes leading/trailing spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true // Converts to lowercase before saving
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ["user", "admin"], // User roles for permissions
    default: "user"
  },
  points: {
    type: Number,
    default: 1000 // Initial points for newly registered users
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// Encrypt password before saving the user document
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password wasn't changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);