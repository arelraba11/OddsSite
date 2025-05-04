const Bet = require("../models/Bet");
const User = require("../models/User");

/**
 * Handles placing a new bet for the authenticated user.
 */
exports.placeBet = async (req, res) => {
  try {
    const { bets, stake, totalOdds, potentialWin } = req.body;

    // Basic input validation
    if (!bets || !stake || !totalOdds || !potentialWin) {
      return res.status(400).json({ message: "Missing bet details." });
    }

    // Format selections for database structure
    const formattedSelections = bets.map(b => ({
      matchId: b.matchId,
      home: b.home,
      away: b.away,
      pick: b.pick,
      odd: b.odd
    }));

    // Create new bet document
    const newBet = new Bet({
      user: req.user.id,
      selections: formattedSelections,
      stake,
      totalOdds,
      potentialWin
    });

    await newBet.save();

    // Deduct points from the user's balance after placing the bet
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { points: -stake } }, // Subtract stake from points
      { new: true }
    );

    res.status(201).json({
      message: "Bet placed successfully.",
      bet: newBet,
      userPoints: updatedUser.points // Return updated points to the client
    });
  } catch (error) {
    console.error("[BET] Bet placing error:", error);
    res.status(500).json({ message: "Server error placing bet." });
  }
};

/**
 * Returns all bets for the currently authenticated user.
 */
exports.getUserBets = async (req, res) => {
  try {
    const bets = await Bet.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bets);
  } catch (error) {
    console.error("[BET] Error fetching user bets:", error);
    res.status(500).json({ message: "Failed to load user bets." });
  }
};

/**
 * Admin-only: Returns all bets in the system, grouped by user.
 */
exports.getAllBetsGroupedByUser = async (req, res) => {
  try {
    const bets = await Bet.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    const grouped = {};

    bets.forEach(bet => {
      const userId = bet.user._id;

      if (!grouped[userId]) {
        grouped[userId] = {
          username: bet.user.username,
          email: bet.user.email,
          bets: []
        };
      }

      grouped[userId].bets.push(bet);
    });

    res.json(grouped);
  } catch (err) {
    console.error("[BET] Error loading all bets:", err);
    res.status(500).json({ message: "Failed to load all bets." });
  }
};