const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema({
  raisedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason:     { type: String, required: true },
  status:     { type: String, enum: ["open", "resolved"], default: "open" },
  raisedAt:   { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null }
}, { _id: false });

const choreSchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },
  title: {
    type: String,
    required: [true, "Chore title is required"],
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rotationOrder: {
    // Array of user IDs defining the rotation sequence
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: []
  },
  isAutoRotate: {
    type: Boolean,
    default: false
  },
  rotationFrequency: {
    type: String,
    enum: ["daily", "weekly", "biweekly", "monthly"],
    default: "weekly"
  },
  nextRotationDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ["pending", "done", "disputed"],
    default: "pending"
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  dispute: {
    type: disputeSchema,
    default: null
  },
  completionHistory: [
    {
      user:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      completedAt: { type: Date },
      onTime:      { type: Boolean }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Chore", choreSchema);
