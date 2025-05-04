const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Import route files
const authRoutes = require("./routes/authRoutes");
const betRoutes = require("./routes/betRoutes");
const oddsRoutes = require("./routes/oddsRoutes");

const app = express();

// ==========================================
// Connect to MongoDB
// ==========================================
connectDB();

// ==========================================
// Global Middleware
// ==========================================
app.use(cors());                  // Enable CORS for all origins
app.use(express.json());         // Parse JSON bodies

// ==========================================
// API Routes
// ==========================================
app.use("/api/auth", authRoutes);    // Routes for authentication
app.use("/api/bets", betRoutes);     // Routes for bet submission and retrieval
app.use("/api/odds", oddsRoutes);    // Routes for fetching sports odds

// ==========================================
// Serve Static Frontend Files
// ==========================================
app.use(express.static(path.join(__dirname, "..", "client"))); // Serve static HTML, CSS, JS

// ==========================================
// Direct Routing for SPA Pages
// ==========================================
app.get("/sports", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "sports.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "profile.html"));
});

// ==========================================
// Fallback - Redirect all other routes to home
// ==========================================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

module.exports = app;