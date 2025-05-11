const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Import route modules
const authRoutes = require("./routes/authRoutes");
const betRoutes = require("./routes/betRoutes");
const oddsRoutes = require("./routes/oddsRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ================================
// Connect to MongoDB
// ================================
connectDB();

// ================================
// Global Middleware
// ================================
app.use(cors());                  // Enable Cross-Origin requests
app.use(express.json());          // Parse JSON bodies from incoming requests

// ================================
// API Routes
// ================================
app.use("/api/auth", authRoutes);     // Authentication (login, user info)
app.use("/api/bets", betRoutes);      // Bets management (create, fetch)
app.use("/api/odds", oddsRoutes);     // External odds API
app.use("/api/admin", adminRoutes);   // Admin-only routes (create users, view users' bets)

// ================================
// Serve Static Frontend Files
// ================================
app.use(express.static(path.join(__dirname, "..", "client")));  // Serves static files (HTML, CSS, JS)

// ================================
// SPA Page Routing
// ================================
app.get("/sports", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "sports.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "profile.html"));
});

// ================================
// Catch-all Route (Fallback to Home)
// ================================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

module.exports = app;