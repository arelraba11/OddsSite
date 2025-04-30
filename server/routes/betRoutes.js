const express = require("express");
const router = express.Router();

// ----------------------------------------------
// GET /api/bets/test
// Temporary route to verify bet routes are working
// ----------------------------------------------
router.get("/test", (req, res) => {
  res.send("Bet route working");
});

module.exports = router;