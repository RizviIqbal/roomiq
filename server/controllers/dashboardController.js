const Chore = require("../models/Chore");
const Expense = require("../models/Expense");
const Notice = require("../models/Notice");
const Rule = require("../models/Rule");
const House = require("../models/House");
const { InventoryItem } = require("../models/Shopping");
const Maintenance = require("../models/Maintenance");
const { calculateBalances } = require("../utils/balanceCalculator");

// @desc    Get aggregated dashboard data for the logged-in user
// @route   GET /api/dashboard/house/:houseId
// @access  Private (House Member)
const getDashboardData = async (req, res) => {
  try {
    const { houseId } = req.params;
    const userId = req.user._id;

    // Execute 7 parallel asynchronous queries
    const [
      house,
      myPendingChores, 
      allExpenses, 
      recentNotices, 
      activePolls,
      lowStock,
      maintenance
    ] = await Promise.all([
      // 1. House info with populated members
      House.findById(houseId).populate("members.user", "name avatar email phone bio occupation bkashNumber"),

      // 2. My pending chores
      Chore.find({ house: houseId, assignedTo: userId, status: "pending" }).sort({ dueDate: 1 }).lean(),

      // 3. All expenses (for balances & recent list)
      Expense.find({ house: houseId }).sort({ date: -1 }).populate("paidBy", "name avatar").populate("splits.user", "name avatar").lean(),

      // 4. Recent noticeboard announcements
      Notice.find({ house: houseId }).sort({ isPinned: -1, createdAt: -1 }).limit(5).populate("postedBy", "name").lean(),

      // 5. Active rule polls
      Rule.find({ house: houseId, status: "proposed" }).lean(),

      // 6. Low stock shopping items
      InventoryItem.find({ house: houseId, $expr: { $lte: ["$currentQuantity", "$lowStockThreshold"] } }).lean(),

      // 7. Active maintenance issues
      Maintenance.find({ house: houseId, status: "reported" }).lean()
    ]);

    // Calculate balances
    const debts = calculateBalances(allExpenses);

    // Extract my unpaid expenses specifically for the quick view
    const myUnpaidExpenses = allExpenses.filter(exp => 
      exp.splits.some(s => s.user?._id?.toString() === userId.toString() && !s.isPaid)
    );

    // Construct the synthesized payload
    const dashboardPayload = {
      house: house,
      chores: myPendingChores,
      expenses: myUnpaidExpenses,
      recentExpenses: allExpenses.slice(0, 5),
      balances: debts,
      lowStock: lowStock,
      maintenance: maintenance,
      notices: recentNotices,
      polls: activePolls,
      timestamp: new Date()
    };

    res.status(200).json(dashboardPayload);
  } catch (error) {
    console.error("Dashboard Aggregator Error:", error);
    res.status(500).json({ message: "Server error generating dashboard payload" });
  }
};

module.exports = {
  getDashboardData
};
