const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  emoji: {
    type: String,
    required: true
  }
}, { _id: false });

const rsvpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["going", "maybe", "not_going"],
    default: "going"
  }
}, { _id: false });

const noticeSchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: null   // null = no expiry
  },
  category: {
    type: String,
    enum: ["announcement", "reminder", "event", "warning", "general"],
    default: "general"
  },
  reactions: [reactionSchema],
  rsvps: [rsvpSchema]
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);
