const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'expense_added', 'expense_paid', 'expense_requested',
      'chore_added', 'chore_done', 'chore_disputed', 'chore_resolved',
      'rule_proposed', 'rule_voted', 'rule_finalized',
      'complaint_filed', 'complaint_resolved',
      'maintenance_reported', 'maintenance_resolved',
      'notice_posted',
      'member_joined', 'member_left'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Index for efficient querying by house and sorting by time
activitySchema.index({ house: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
