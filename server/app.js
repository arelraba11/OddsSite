const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const betRoutes = require("./routes/betRoutes");
const oddsRoutes = require("./routes/oddsRoutes");

const app = express();

// ----------------------------------------
// Connect to MongoDB
// ----------------------------------------
connectDB();

// ----------------------------------------
// Global Middleware
// ----------------------------------------
app.use(cors());              // Enable Cross-Origin requests
app.use(express.json());      // Parse incoming JSON request bodies

// ----------------------------------------
// API Routes
// ----------------------------------------
app.use("/api/auth", authRoutes);    // Authentication endpoints
app.use("/api/bets", betRoutes);     // Betting endpoints
app.use("/api/odds", oddsRoutes);    // Odds API proxy endpoint

// ----------------------------------------
// Serve Static Frontend Files
// ----------------------------------------
app.use(express.static(path.join(__dirname, "..", "client"))); // Serve client assets

// ----------------------------------------
// Specific Page Routing
// ----------------------------------------
app.get("/sports", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "sports.html"));
});

// ----------------------------------------
// Fallback for client-side routing
// ----------------------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});


module.exports = app;