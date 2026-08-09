const mongoose = require("mongoose");

const mediationVoteSchema = new mongoose.Schema({
  voter:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verdict:  { type: String, enum: ["valid", "invalid"] },
  comment:  { type: String, default: "" },
  votedAt:  { type: Date, default: Date.now }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },
  // null = anonymous
  filedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  against: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["noise", "cleanliness", "guests", "bills", "behavior", "other"],
    default: "other"
  },
  status: {
    type: String,
    enum: ["open", "under_mediation", "resolved", "dismissed"],
    default: "open"
  },
  mediationVotes: [mediationVoteSchema],
  mediationDeadline: {
    type: Date,
    default: null
  },
  resolution: {
    type: String,
    default: ""
  },
  resolvedAt: { type: Date, default: null },
  // Track if this person has been repeatedly complained about
  isRepeatOffense: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
