const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vote:   { type: String, enum: ["yes", "no"] },
  votedAt:{ type: Date, default: Date.now }
}, { _id: false });

const ruleSchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },
  title: {
    type: String,
    required: [true, "Rule title is required"],
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["voting", "active", "rejected"],
    default: "voting"
  },
  votes: [voteSchema],
  votingDeadline: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ["guests", "noise", "cleanliness", "kitchen", "bathroom", "general"],
    default: "general"
  },
  approvedAt: { type: Date, default: null }
}, { timestamps: true });

// Virtual: vote counts
ruleSchema.virtual("yesCount").get(function () {
  return this.votes.filter(v => v.vote === "yes").length;
});
ruleSchema.virtual("noCount").get(function () {
  return this.votes.filter(v => v.vote === "no").length;
});

module.exports = mongoose.model("Rule", ruleSchema);
