const mongoose = require("mongoose");

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
  }
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);
