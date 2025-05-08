const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to protect routes that require authentication.
 * It verifies the JWT token and attaches the authenticated user to the request object.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from the header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // Decode and verify the token using the secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user object to the request (excluding the password)
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      // Token exists but failed verification
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }

  // No token was found in the Authorization header
  return res.status(401).json({ message: "Not authorized, no token provided" });
};

module.exports = { protect };