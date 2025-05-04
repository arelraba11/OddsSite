const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to protect routes that require authentication.
 * Verifies JWT and attaches the authenticated user to the request object.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // Decode and verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID and exclude the password field
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      // Optional log for debugging:
      // console.warn("[AUTH] Token verification failed.");
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }

  // If no token found, deny access
  return res.status(401).json({ message: "Not authorized, no token provided" });
};

module.exports = { protect };