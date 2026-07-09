const Expense = require("../models/Expense");
const House   = require("../models/House");
const { calculateBalances, simplifyDebts } = require("../utils/balanceCalculator");
const { emitToHouse } = require("../socket");
const logActivity = require("../utils/activityLogger");

// @desc   Add a new expense
// @route  POST /api/expenses
const addExpense = async (req, res) => {
  try {
    const { houseId, title, totalAmount, category, splitType, splits, isRecurring, recurringDay, note, date } = req.body;

    const house = await House.findById(houseId);
    if (!house) return res.status(404).json({ message: "House not found" });

    let finalSplits = [];

    if (splitType === "equal") {
      const memberIds = house.members.map(m => m.user);
      const splitAmount = parseFloat((totalAmount / memberIds.length).toFixed(2));
      finalSplits = memberIds.map(uid => ({
        user:   uid,
        amount: splitAmount,
        isPaid: uid.toString() === req.user._id.toString() // payer auto-marked paid
      }));
    } else {
      // Custom splits provided by client
      finalSplits = splits.map(s => ({
        ...s,
        isPaid: s.user.toString() === req.user._id.toString()
      }));
    }

    const expense = await Expense.create({
      house: houseId,
      title,
      totalAmount,
      category,
      paidBy: req.user._id,
      splitType,
      splits: finalSplits,
      isRecurring,
      recurringDay,
      note,
      date: date || new Date()
    });

    await expense.populate("paidBy", "name avatar");
    await expense.populate("splits.user", "name avatar");

    emitToHouse(houseId, "expense_added", expense);
    logActivity(houseId, req.user._id, "expense_added", `Added expense: ${title}`, `Amount: ${totalAmount}`);

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get all expenses for a house
// @route  GET /api/expenses/house/:houseId
const getHouseExpenses = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = { house: req.params.houseId };
    if (category) filter.category = category;

    const expenses = await Expense.find(filter)
      .populate("paidBy", "name avatar")
      .populate("splits.user", "name avatar")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Expense.countDocuments(filter);

    res.json({ expenses, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Submit payment for your share (pending approval)
// @route  PUT /api/expenses/:expenseId/submit-payment
const submitPayment = async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const split = expense.splits.find(s => s.user.toString() === req.user._id.toString());
    if (!split) return res.status(400).json({ message: "You are not part of this expense" });
    if (split.isPaid || split.status === "pending_approval") {
      return res.status(400).json({ message: "Payment already submitted or paid" });
    }

    split.status = "pending_approval";
    split.paymentMethod = paymentMethod || "cash";
    if (transactionId) split.transactionId = transactionId;

    await expense.save();

    emitToHouse(expense.house.toString(), "expense_updated", { expenseId: expense._id, type: "payment_submitted" });

    res.json({ message: "Payment submitted for approval", expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Approve a pending payment (only payer can do this)
// @route  PUT /api/expenses/:expenseId/approve-payment
const approvePayment = async (req, res) => {
  try {
    const { userId } = req.body; // the user whose payment is being approved
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the person who paid the expense can approve payments" });
    }

    const split = expense.splits.find(s => s.user.toString() === userId);
    if (!split) return res.status(400).json({ message: "User is not part of this expense" });
    
    split.status = "paid";
    split.isPaid = true;
    split.paidAt = new Date();

    await expense.save();

    emitToHouse(expense.house.toString(), "expense_updated", { expenseId: expense._id, type: "payment_approved" });

    res.json({ message: "Payment approved", expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Request payment from a specific roommate
// @route  POST /api/expenses/:expenseId/request-payment
const requestPayment = async (req, res) => {
  try {
    const { toUserId } = req.body;
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    // Verify the requester is the payer
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the person who paid can request payment" });
    }

    const split = expense.splits.find(s => s.user.toString() === toUserId);
    if (!split) return res.status(400).json({ message: "User is not part of this expense" });
    if (split.isPaid) return res.status(400).json({ message: "This person has already paid" });

    // Avoid duplicate requests
    const alreadyRequested = expense.paymentRequests.find(
      r => r.to.toString() === toUserId && r.status === "pending"
    );
    if (alreadyRequested) return res.status(400).json({ message: "Payment already requested" });

    expense.paymentRequests.push({
      from:   req.user._id,
      to:     toUserId,
      amount: split.amount,
      status: "pending"
    });

    await expense.save();

    emitToHouse(expense.house.toString(), "payment_requested", {
      expenseId: expense._id,
      to: toUserId,
      from: req.user._id,
      amount: split.amount,
      title: expense.title,
    });

    res.json({ message: "Payment request sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get balance summary for a house (who owes whom)
// @route  GET /api/expenses/house/:houseId/balances
const getBalances = async (req, res) => {
  try {
    const { simplify } = req.query;

    const expenses = await Expense.find({ house: req.params.houseId })
      .populate("paidBy", "name avatar")
      .populate("splits.user", "name avatar");

    let debts = calculateBalances(expenses);

    if (simplify === "true") {
      debts = simplifyDebts(debts);
    }

    res.json(debts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Delete an expense (payer or admin only)
// @route  DELETE /api/expenses/:expenseId
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the payer can delete this expense" });
    }

    const houseId = expense.house.toString();
    await expense.deleteOne();

    emitToHouse(houseId, "expense_deleted", { expenseId: expense._id });

    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addExpense, getHouseExpenses, submitPayment, approvePayment, requestPayment, getBalances, deleteExpense };
