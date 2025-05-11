const User = require("../models/User");
const Bet = require("../models/Bet");

/**
 * Admin creates a new user that will be linked to him via createdBy
 * Only admins can access this route (enforced in route middleware)
 */
exports.createUserByAdmin = async (req, res) => {
  try {
    const { username, email, password, points } = req.body;

    // Validate required fields
    if (!username || !email || !password || points == null) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Create new user and link to current admin
    const newUser = new User({
      username,
      email,
      password,
      points,
      createdBy: req.user._id
    });

    await newUser.save();

    // Respond with user summary (no password)
    res.status(201).json({
      message: "User created successfully.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        points: newUser.points
      }
    });
  } catch (err) {
    console.error("createUserByAdmin error:", err);
    res.status(500).json({ message: "Server error while creating user." });
  }
};

/**
 * Admin fetches all bets from users he created (managed users)
 * Grouped by user object (username + email + their bets[])
 */
exports.getBetsOfManagedUsers = async (req, res) => {
  try {
    // Get all users created by the current admin
    const managedUsers = await User.find({ createdBy: req.user._id })
      .select("_id username email");

    // Map of userId → { username, email, bets: [] }
    const userMap = {};
    managedUsers.forEach(u => {
      userMap[u._id] = {
        username: u.username,
        email: u.email,
        bets: []
      };
    });

    const userIds = managedUsers.map(u => u._id);

    // Get all bets placed by users managed by this admin
    const bets = await Bet.find({ user: { $in: userIds } })
      .sort({ createdAt: -1 });

    // Assign each bet to its corresponding user in the map
    bets.forEach(bet => {
      if (userMap[bet.user]) {
        userMap[bet.user].bets.push(bet);
      }
    });

    res.status(200).json(userMap);
  } catch (err) {
    console.error("getBetsOfManagedUsers error:", err);
    res.status(500).json({ message: "Failed to fetch bets." });
  }
};