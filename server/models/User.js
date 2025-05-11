const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define the User schema (MongoDB model)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true // Remove leading/trailing spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true // Convert to lowercase before saving
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ["user", "admin"], // User role (permissions)
    default: "user"
  },
  points: {
    type: Number,
    default: 1000 // Starting points for each user
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // Reference to the admin who created this user (if applicable)
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Pre-save hook: hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password was modified
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);