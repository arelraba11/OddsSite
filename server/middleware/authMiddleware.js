const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware: Protects routes by verifying the JWT token.
 * If valid, attaches the user (without password) to req.user
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify and decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB and attach to request
      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized: Invalid token" });
    }
  }

  return res.status(401).json({ message: "Not authorized: No token provided" });
};

/**
 * Middleware: Allows only admin users to proceed.
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied: Admins only" });
};

module.exports = { protect, isAdmin };