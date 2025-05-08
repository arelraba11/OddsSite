const Bet = require("../models/Bet");
const User = require("../models/User");

exports.placeBet = async (userId, bets, stake, totalOdds, potentialWin) => {
  if (!bets || !Array.isArray(bets) || bets.length === 0 || !stake || !totalOdds || !potentialWin) {
    throw new Error("Invalid or missing bet details.");
  }

  const matchIds = bets.map(b => b.matchId);
  if (new Set(matchIds).size !== matchIds.length) {
    throw new Error("Duplicate match selections are not allowed.");
  }

  const user = await User.findById(userId);
  if (!user || user.points < stake) {
    throw new Error("Insufficient points to place bet.");
  }

  const formattedSelections = bets.map(b => ({
    matchId: b.matchId,
    home: b.home,
    away: b.away,
    pick: b.pick,
    odd: b.odd
  }));

  const newBet = new Bet({
    user: userId,
    selections: formattedSelections,
    stake,
    totalOdds,
    potentialWin,
    isResolved: false,
    isWin: null,
    pointsRewarded: 0
  });

  await newBet.save();

  user.points -= stake;
  await user.save();

  return { bet: newBet, updatedPoints: user.points };
};

exports.resolveBet = async (bet, gameResults) => {
  if (bet.isResolved) return;

  let allCorrect = true;

  for (const selection of bet.selections) {
    const result = gameResults.find(gr => gr.matchId === selection.matchId);
    if (!result) {
      allCorrect = false;
      break;
    }

    const { homeScore, awayScore } = result;
    const outcome = homeScore > awayScore ? "HOME" : homeScore < awayScore ? "AWAY" : "DRAW";

    if (outcome !== selection.pick) {
      allCorrect = false;
      break;
    }
  }

  bet.isResolved = true;
  bet.isWin = allCorrect;

  if (allCorrect) {
    const reward = Math.floor(bet.stake * bet.totalOdds);
    bet.pointsRewarded = reward;
    await User.findByIdAndUpdate(bet.user, { $inc: { points: reward } });
  }

  await bet.save();
};

exports.resolveAllUnresolvedBets = async (gameResults) => {
  const unresolvedBets = await Bet.find({ isResolved: false });

  for (const bet of unresolvedBets) {
    await exports.resolveBet(bet, gameResults);
  }

  return { resolved: unresolvedBets.length };
};

exports.getUserBets = async (userId) => {
  return await Bet.find({ user: userId }).sort({ createdAt: -1 });
};

exports.getAllBetsGroupedByUser = async () => {
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

  return grouped;
};