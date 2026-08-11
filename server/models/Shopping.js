const mongoose = require("mongoose");

// Shopping List Item
const shoppingItemSchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: ""   // e.g. kg, liters, pieces
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  isBought: {
    type: Boolean,
    default: false
  },
  boughtBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  cost: {
    type: Number,
    default: null   // filled when bought
  },
  boughtAt: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    enum: ["groceries", "cleaning", "toiletries", "kitchen", "other"],
    default: "other"
  }
}, { timestamps: true });

// Household Inventory Item
const inventoryItemSchema = new mongoose.Schema({
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  currentQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: ""
  },
  lowStockThreshold: {
    type: Number,
    required: true   // alert when currentQuantity <= this
  },
  category: {
    type: String,
    enum: ["groceries", "cleaning", "toiletries", "kitchen", "other"],
    default: "other"
  },
  lastRestockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  lastRestockedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Virtual: isLowStock
inventoryItemSchema.virtual("isLowStock").get(function () {
  return this.currentQuantity <= this.lowStockThreshold;
});

const ShoppingItem  = mongoose.model("ShoppingItem",  shoppingItemSchema);
const InventoryItem = mongoose.model("InventoryItem", inventoryItemSchema);

module.exports = { ShoppingItem, InventoryItem };
