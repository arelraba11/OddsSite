const express = require("express");
const router = express.Router();
const axios = require("axios");

const ODDS_API_KEY = process.env.ODDS_API_KEY;

// -------------------------------------------------------------
// GET /api/odds/sports
// Fetches Champions League matches with head-to-head odds
// -------------------------------------------------------------
router.get("/sports", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.the-odds-api.com/v4/sports/soccer_uefa_champs_league/odds",
      {
        params: {
          apiKey: ODDS_API_KEY,      // Your personal API key from The Odds API
          regions: "eu",             // Region filter: Europe
          markets: "h2h",            // Market type: Head-to-head matchups
          oddsFormat: "decimal",     // Odds display format: decimal
        },
      }
    );

    // Send data back to the client
    res.json(response.data);
  } catch (error) {
    console.error("Odds API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch sports odds" });
  }
});

module.exports = router;