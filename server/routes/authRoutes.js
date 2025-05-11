const express = require("express");
const router = express.Router();

const {
  login,
  getMe
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// ========================================
// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
// ========================================
router.post("/login", login);

// ========================================
// @route   GET /api/auth/me
// @desc    Get currently authenticated user's info
// @access  Private (requires valid token)
// ========================================
router.get("/me", protect, getMe);

module.exports = router;