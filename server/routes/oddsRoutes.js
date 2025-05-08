// routes/oddsRoutes.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

const ODDS_API_KEY = process.env.ODDS_API_KEY;

/**
 * @route   GET /api/odds/sports
 * @desc    Fetch all upcoming matches with head-to-head odds from The Odds API
 * @access  Public
 */
router.get("/sports", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.the-odds-api.com/v4/sports/upcoming/odds",
      {
        params: {
          apiKey: ODDS_API_KEY,
          regions: "eu",           // European region
          markets: "h2h",          // Head-to-head market
          oddsFormat: "decimal",   // Decimal odds format
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Odds API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch sports odds" });
  }
});

module.exports = router;