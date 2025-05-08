const betService = require("../services/betService");

/**
 * Controller for placing a new bet
 * @route POST /api/bets/
 * @access Private
 */
exports.placeBet = async (req, res) => {
  try {
    const { bets, stake, totalOdds, potentialWin } = req.body;

    // Call the service to place the bet
    const result = await betService.placeBet(req.user.id, bets, stake, totalOdds, potentialWin);

    res.status(201).json({
      message: "Bet placed successfully.",
      bet: result.bet,
      userPoints: result.updatedPoints
    });
  } catch (error) {
    console.error("[BET] Bet placing error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Controller for manually resolving all unresolved bets
 * @route POST /api/bets/resolve
 * @access Admin
 */
exports.resolveBetsManually = async (req, res) => {
  try {
    const gameResults = req.body.results;

    // Validate the input results array
    if (!Array.isArray(gameResults) || gameResults.length === 0) {
      return res.status(400).json({ message: "Missing or invalid game results." });
    }

    // Resolve all open bets using the provided results
    const result = await betService.resolveAllUnresolvedBets(gameResults);

    res.json({ message: "All unresolved bets processed.", ...result });
  } catch (error) {
    console.error("[BET] Manual resolve error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller to fetch the current user's bets
 * @route GET /api/bets/user
 * @access Private
 */
exports.getUserBets = async (req, res) => {
  try {
    const bets = await betService.getUserBets(req.user.id);
    res.json(bets);
  } catch (error) {
    console.error("[BET] Error fetching user bets:", error);
    res.status(500).json({ message: "Failed to load user bets." });
  }
};

/**
 * Controller to fetch all bets in the system, grouped by user
 * @route GET /api/bets/all
 * @access Admin
 */
exports.getAllBetsGroupedByUser = async (req, res) => {
  try {
    const grouped = await betService.getAllBetsGroupedByUser();
    res.json(grouped);
  } catch (error) {
    console.error("[BET] Error loading all bets:", error);
    res.status(500).json({ message: "Failed to load all bets." });
  }
};