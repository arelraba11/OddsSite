const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token with user ID, role, and username.
 * Token expires in 7 days.
 * @param {Object} user - Mongoose User document
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Register a new user (disabled)
 * @route   POST /api/auth/register
 * @access  Disabled
 */
exports.register = (req, res) => {
  return res.status(403).json({ message: "Registration is disabled. Contact your agent." });
};

/**
 * Log in existing user and return token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ensure all fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Respond with token and user info
    const token = generateToken(user);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

/**
 * Get current logged-in user information
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Failed to fetch user." });
  }
};