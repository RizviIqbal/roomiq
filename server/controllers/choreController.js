const Chore = require("../models/Chore");
const { emitToHouse } = require("../socket");
const logActivity = require("../utils/activityLogger");

// @desc   Create a chore
// @route  POST /api/chores
const createChore = async (req, res) => {
  try {
    const { houseId, title, description, assignedTo, rotationOrder, isAutoRotate, rotationFrequency, dueDate } = req.body;

    let nextRotationDate = null;
    if (isAutoRotate) {
      const due = new Date(dueDate);
      nextRotationDate = due;
    }

    const chore = await Chore.create({
      house: houseId,
      title,
      description,
      assignedTo,
      rotationOrder: rotationOrder || [assignedTo],
      isAutoRotate:  isAutoRotate || false,
      rotationFrequency,
      nextRotationDate,
      dueDate
    });

    await chore.populate("assignedTo", "name avatar");

    emitToHouse(houseId, "chore_updated", { type: "created", chore });
    logActivity(houseId, req.user._id, "chore_added", `Added chore: ${title}`);

    res.status(201).json(chore);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get all chores for a house
// @route  GET /api/chores/house/:houseId
const getHouseChores = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { house: req.params.houseId };
    if (status) filter.status = status;

    const chores = await Chore.find(filter)
      .populate("assignedTo", "name avatar")
      .populate("rotationOrder", "name avatar")
      .populate("completionHistory.user", "name avatar")
      .sort({ dueDate: 1 });

    res.json(chores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Mark chore as done
// @route  PUT /api/chores/:choreId/done
const markDone = async (req, res) => {
  try {
    const chore = await Chore.findById(req.params.choreId);
    if (!chore) return res.status(404).json({ message: "Chore not found" });

    if (chore.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the assigned person can mark this done" });
    }

    const now = new Date();
    chore.status      = "done";
    chore.completedAt = now;
    chore.completionHistory.push({
      user:        req.user._id,
      completedAt: now,
      onTime:      now <= new Date(chore.dueDate)
    });

    await chore.save();
    emitToHouse(chore.house.toString(), "chore_updated", { type: "done", choreId: chore._id, status: chore.status });

    res.json({ message: "Chore marked as done", chore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Raise a dispute on a chore
// @route  POST /api/chores/:choreId/dispute
const raiseDispute = async (req, res) => {
  try {
    const { reason } = req.body;
    const chore = await Chore.findById(req.params.choreId);
    if (!chore) return res.status(404).json({ message: "Chore not found" });

    if (chore.status !== "done") {
      return res.status(400).json({ message: "Can only dispute a chore marked as done" });
    }

    chore.status  = "disputed";
    chore.dispute = { raisedBy: req.user._id, reason, status: "open" };
    await chore.save();

    emitToHouse(chore.house.toString(), "chore_updated", { type: "disputed", choreId: chore._id, status: chore.status });

    res.json({ message: "Dispute raised", chore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Resolve a dispute
// @route  PUT /api/chores/:choreId/dispute/resolve
const resolveDispute = async (req, res) => {
  try {
    const { resolution } = req.body; // "valid" or "invalid"
    const chore = await Chore.findById(req.params.choreId);
    if (!chore) return res.status(404).json({ message: "Chore not found" });
    if (!chore.dispute) return res.status(400).json({ message: "No dispute on this chore" });

    chore.dispute.status     = "resolved";
    chore.dispute.resolvedAt = new Date();
    chore.status = resolution === "valid" ? "pending" : "done"; // if valid = redo it
    await chore.save();

    emitToHouse(chore.house.toString(), "chore_updated", { type: "dispute_resolved", choreId: chore._id, status: chore.status });

    res.json({ message: `Dispute resolved: chore marked as ${chore.status}`, chore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get chore completion history per member (accountability)
// @route  GET /api/chores/house/:houseId/history
const getChoreHistory = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const houseId = new mongoose.Types.ObjectId(req.params.houseId);
    
    const stats = await Chore.aggregate([
      { $match: { house: houseId } },
      { $unwind: "$completionHistory" },
      {
        $group: {
          _id: "$completionHistory.user",
          completed: { $sum: 1 },
          onTime: { $sum: { $cond: ["$completionHistory.onTime", 1, 0] } },
          late: { $sum: { $cond: ["$completionHistory.onTime", 0, 1] } }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          user: { _id: "$user._id", name: "$user.name", avatar: "$user.avatar" },
          completed: 1,
          onTime: 1,
          late: 1
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createChore, getHouseChores, markDone, raiseDispute, resolveDispute, getChoreHistory };
