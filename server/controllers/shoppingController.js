const { ShoppingItem, InventoryItem } = require("../models/Shopping");
const Expense = require("../models/Expense");
const House = require("../models/House");
const { emitToHouse } = require("../socket");

// ─── SHOPPING LIST ────────────────────────────────────────────────

const addShoppingItem = async (req, res) => {
  try {
    const { houseId, name, quantity, unit, category } = req.body;
    const item = await ShoppingItem.create({
      house: houseId, name, quantity, unit, category,
      addedBy: req.user._id
    });
    await item.populate("addedBy", "name avatar");

    emitToHouse(houseId, "shopping_updated", { type: "added", item });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getShoppingList = async (req, res) => {
  try {
    const items = await ShoppingItem.find({ house: req.params.houseId })
      .populate("addedBy", "name avatar")
      .populate("boughtBy", "name avatar")
      .populate("claimedBy", "name avatar")
      .sort({ isBought: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markItemBought = async (req, res) => {
  try {
    const { cost } = req.body;
    const item = await ShoppingItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.isBought = true;
    item.boughtBy = req.user._id;
    item.cost     = cost || null;
    item.boughtAt = new Date();

    await item.save();
    emitToHouse(item.house.toString(), "shopping_updated", { type: "bought", itemId: item._id });

    res.json({ message: "Item marked as bought", item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteShoppingItem = async (req, res) => {
  try {
    await ShoppingItem.findByIdAndDelete(req.params.itemId);
    res.json({ message: "Item removed from list" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Claim item
const claimItem = async (req, res) => {
  try {
    const item = await ShoppingItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Toggle claim
    if (item.claimedBy && item.claimedBy.toString() === req.user._id.toString()) {
      item.claimedBy = null;
    } else {
      item.claimedBy = req.user._id;
    }
    
    await item.save();
    await item.populate("claimedBy", "name avatar");
    emitToHouse(item.house.toString(), "shopping_updated", { type: "claimed", item });
    
    res.json({ message: "Item claim updated", item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Checkout Items to Expense
const checkoutItems = async (req, res) => {
  try {
    const { houseId, items } = req.body; // items: [{ _id, cost }]
    if (!items || items.length === 0) return res.status(400).json({ message: "No items provided" });

    let totalCost = 0;
    const boughtItems = [];

    // Mark all as bought
    for (const i of items) {
      const item = await ShoppingItem.findById(i._id);
      if (item && !item.isBought) {
        item.isBought = true;
        item.boughtBy = req.user._id;
        item.cost = Number(i.cost) || 0;
        item.boughtAt = new Date();
        await item.save();
        totalCost += item.cost;
        boughtItems.push(item);
      }
    }

    // Auto-create expense if totalCost > 0
    if (totalCost > 0) {
      const house = await House.findById(houseId);
      if (house && house.members.length > 0) {
        // Equal split
        const splitAmount = parseFloat((totalCost / house.members.length).toFixed(2));
        const splits = house.members.map(m => ({
          user: m.user,
          amount: splitAmount,
          isPaid: m.user.toString() === req.user._id.toString(),
          paidAt: m.user.toString() === req.user._id.toString() ? new Date() : null
        }));

        await Expense.create({
          house: houseId,
          title: "Groceries (Auto Checkout)",
          totalAmount: totalCost,
          category: "groceries",
          paidBy: req.user._id,
          splitType: "equal",
          splits
        });
      }
    }

    emitToHouse(houseId, "shopping_updated", { type: "checkout" });
    res.json({ message: "Checkout complete, expense created", totalCost });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW: Store Alert
const storeAlert = async (req, res) => {
  try {
    const { houseId } = req.body;
    // Emitting the socket event globally to the house room
    emitToHouse(houseId, "shopping_alert", { senderName: req.user.name });
    res.json({ message: "Alert sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── INVENTORY ───────────────────────────────────────────────────

const addInventoryItem = async (req, res) => {
  try {
    const { houseId, name, currentQuantity, unit, lowStockThreshold, category } = req.body;
    const item = await InventoryItem.create({
      house: houseId, name, currentQuantity, unit, lowStockThreshold, category
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find({ house: req.params.houseId })
      .populate("lastRestockedBy", "name avatar")
      .sort({ name: 1 });

    const withFlags = items.map(item => ({
      ...item.toObject(),
      isLowStock: item.currentQuantity <= item.lowStockThreshold
    }));

    res.json(withFlags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { currentQuantity } = req.body;
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.itemId,
      {
        currentQuantity,
        lastRestockedBy: req.user._id,
        lastRestockedAt: new Date()
      },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    const isLowStock = item.currentQuantity <= item.lowStockThreshold;

    // Smart Restocking: Auto-add to shopping list if low stock
    if (isLowStock) {
      // Check if it's already pending
      const pendingItem = await ShoppingItem.findOne({ 
        house: item.house, 
        name: item.name, 
        isBought: false 
      });
      if (!pendingItem) {
        await ShoppingItem.create({
          house: item.house,
          name: item.name,
          quantity: 1,
          unit: item.unit,
          category: item.category,
          addedBy: req.user._id // The person who reported it low
        });
        emitToHouse(item.house.toString(), "shopping_updated", { type: "auto_added" });
      }
      emitToHouse(item.house.toString(), "low_stock_alert", { itemId: item._id, name: item.name, currentQuantity: item.currentQuantity });
    }

    emitToHouse(item.house.toString(), "inventory_updated", {
      itemId: item._id, name: item.name, currentQuantity: item.currentQuantity, isLowStock,
    });

    res.json({ ...item.toObject(), isLowStock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const items = await InventoryItem.find({ house: req.params.houseId });
    const lowStock = items.filter(i => i.currentQuantity <= i.lowStockThreshold);
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addShoppingItem, getShoppingList, markItemBought, deleteShoppingItem, claimItem, checkoutItems, storeAlert,
  addInventoryItem, getInventory, updateInventory, getLowStockItems
};
