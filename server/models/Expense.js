const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount:        { type: Number, required: true },
  status:        { type: String, enum: ["unpaid", "pending_approval", "paid"], default: "unpaid" },
  paymentMethod: { type: String, enum: ["cash", "bkash", "other"], default: "cash" },
  transactionId: { type: String, default: "" },
  isPaid:        { type: Boolean, default: false },
  paidAt:        { type: Date, default: null }
}, { _id: false });

const paymentRequestSchema = new mongoose.Schema({
  from:        { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who is owed
  to:          { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who needs to pay
  amount:      { type: Number, required: true },
  status:      { type: String, enum: ["pending", "acknowledged", "paid"], default: "pending" },
  requestedAt: { type: Date, default: Date.now }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },
  title: {
    type: String,
    required: [true, "Expense title is required"],
    trim: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ["rent", "electricity", "water", "internet", "groceries", "maintenance", "other"],
    default: "other"
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  splitType: {
    type: String,
    enum: ["equal", "custom"],
    default: "equal"
  },
  splits: [splitSchema],
  paymentRequests: [paymentRequestSchema],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDay: {
    type: Number,  // day of month (1-31)
    default: null
  },
  note: {
    type: String,
    maxlength: 500,
    default: ""
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
