const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// ==========================
// @route   POST /api/auth/register
// @desc    [DISABLED] Registration is blocked
// @access  Public
// ==========================
router.post("/register", register);

// ==========================
// @route   POST /api/auth/login
// @desc    Authenticate user and return JWT
// @access  Public
// ==========================
router.post("/login", login);

// ==========================
// @route   GET /api/auth/me
// @desc    Get current logged-in user's data
// @access  Private
// ==========================
router.get("/me", protect, getMe);

module.exports = router;