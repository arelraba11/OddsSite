const express = require("express");
const router = express.Router();

// Import route controllers
const {
  placeBet,
  getUserBets,
  getAllBetsGroupedByUser
} = require("../controllers/betController");

// Import middleware to protect routes
const { protect } = require("../middleware/authMiddleware");

/**
 * @route   GET /api/bets/all
 * @desc    Admin - Get all bets grouped by user
 * @access  Private (admin)
 */
router.get("/all", protect, getAllBetsGroupedByUser);

/**
 * @route   POST /api/bets/
 * @desc    Place a new bet
 * @access  Private (authenticated users)
 */
router.post("/", protect, placeBet);

/**
 * @route   GET /api/bets/user
 * @desc    Get current user's bets
 * @access  Private (authenticated users)
 */
router.get("/user", protect, getUserBets);

module.exports = router;