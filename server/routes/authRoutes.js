const express = require("express");
const router = express.Router();

// ----------------------------------------------
// GET /api/auth/test
// Temporary route to verify auth routes are working
// ----------------------------------------------
router.get("/test", (req, res) => {
  res.send("Auth route working");
});

module.exports = router;