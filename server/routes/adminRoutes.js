const express = require("express");
const router = express.Router();

const { protect, isAdmin } = require("../middleware/authMiddleware");
const {
  createUserByAdmin,
  getBetsOfManagedUsers
} = require("../controllers/adminController");

// =============================================
// @route   POST /api/admin/create-user
// @desc    Allow admin to create a new user under their management
// @access  Private (admin only)
// =============================================
router.post("/create-user", protect, isAdmin, createUserByAdmin);

// =============================================
// @route   GET /api/admin/bets
// @desc    Get all bets of users managed by this admin
// @access  Private (admin only)
// =============================================
router.get("/bets", protect, isAdmin, getBetsOfManagedUsers);

module.exports = router;