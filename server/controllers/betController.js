const Bet = require("../models/Bet");

exports.placeBet = async (req, res) => {
  try {
    console.log("===> Entered placeBet()");
    console.log("User ID:", req.user.id);
    console.log("Request body:", req.body);

    const { bets, stake, totalOdds, potentialWin } = req.body;

    // Validate required fields
    if (!bets || !stake || !totalOdds || !potentialWin) {
      console.log("Missing fields in request body");
      return res.status(400).json({ message: "Missing bet details." });
    }

    // Create new bet with 'selections' instead of 'bets'
    const formattedSelections = bets.map(b => ({
        matchId: b.match,
        home: b.home,
        away: b.away,
        pick: b.pick,
        odd: b.odd
      }));
      
      const newBet = new Bet({
        user: req.user.id,
        selections: formattedSelections,
        stake,
        totalOdds,
        potentialWin
      });

    await newBet.save();

    console.log("Bet saved successfully:", newBet);

    res.status(201).json({
      message: "Bet placed successfully.",
      bet: newBet
    });
  } catch (error) {
    console.error("Bet placing error:", error);
    res.status(500).json({ message: "Server error placing bet." });
  }
};