const express = require("express");
const router = express.Router();

// Import route controllers
const {
  placeBet,
  getUserBets,
  getAllBetsGroupedByUser
} = require("../controllers/betController");

// Import authentication middleware
const { protect } = require("../middleware/authMiddleware");

/**
 * @route   GET /api/bets/all
 * @desc    Admin - Get all bets grouped by user
 * @access  Private (admin only)
 */
router.get("/all", protect, getAllBetsGroupedByUser);

/**
 * @route   POST /api/bets/
 * @desc    Place a new bet for the logged-in user
 * @access  Private (authenticated users)
 */
router.post("/", protect, placeBet);

/**
 * @route   GET /api/bets/user
 * @desc    Get all bets for the current logged-in user
 * @access  Private (authenticated users)
 */
router.get("/user", protect, getUserBets);

module.exports = router;