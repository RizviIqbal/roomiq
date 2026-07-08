const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },
  title: {
    type: String,
    required: [true, "Issue title is required"],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  category: {
    type: String,
    enum: ["plumbing", "electrical", "appliance", "structural", "pest", "other"],
    default: "other"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["reported", "acknowledged", "in_progress", "resolved"],
    default: "reported"
  },
  statusHistory: [
    {
      status:    { type: String },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      note:      { type: String, default: "" },
      updatedAt: { type: Date, default: Date.now }
    }
  ],
  resolvedAt: {
    type: Date,
    default: null
  },
  imageUrl: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Maintenance", maintenanceSchema);
