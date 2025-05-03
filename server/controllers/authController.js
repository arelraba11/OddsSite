const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token with user ID, role, and username.
 * Token expires in 7 days.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Create and save the new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Generate token and respond
    const token = generateToken(newUser);
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        points: newUser.points,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
};

/**
 * @desc    Log in existing user and return token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate token and respond
    const token = generateToken(user);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

/**
 * @desc    Get data of the logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};