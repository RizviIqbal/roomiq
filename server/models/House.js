const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member"
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const houseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "House name is required"],
    trim: true
  },
  address: {
    type: String,
    required: [true, "Address is required"]
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 1
  },
  monthlyRent: {
    type: Number,
    required: true,
    min: 0
  },
  inviteCode: {
    type: String,
    unique: true,
    required: true
  },
  members: [memberSchema],
  maxMembers: {
    type: Number,
    default: 10
  },
  currency: {
    type: String,
    default: "BDT"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }]
}, { timestamps: true });

// Virtual: member count
houseSchema.virtual("memberCount").get(function () {
  return this.members.length;
});

module.exports = mongoose.model("House", houseSchema);
