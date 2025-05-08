const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  selections: [
    {
      matchId: { type: String, required: true },
      home: { type: String, required: true },
      away: { type: String, required: true },
      pick: { type: String, required: true }, // "Arsenal", "Draw", "Chelsea"
      odd: { type: Number, required: true }
    }
  ],
  stake: {
    type: Number,
    required: true
  },
  totalOdds: {
    type: Number,
    required: true
  },
  potentialWin: {
    type: Number,
    required: true
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  isWin: {
    type: Boolean,
    default: null
  },
  pointsRewarded: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Bet", betSchema);