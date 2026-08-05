const Maintenance = require("../models/Maintenance");
const { emitToHouse } = require("../socket");

// @desc   Report a maintenance issue
// @route  POST /api/maintenance
const reportIssue = async (req, res) => {
  try {
    const { houseId, title, description, category, priority } = req.body;
    let imageUrl = req.body.imageUrl || "";

    // If an image was uploaded via multer, use that path
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const issue = await Maintenance.create({
      house:       houseId,
      title,
      description,
      category,
      priority,
      imageUrl,
      reportedBy:  req.user._id,
      statusHistory: [{ status: "reported", updatedBy: req.user._id, note: "Issue reported" }]
    });

    await issue.populate("reportedBy", "name avatar");

    emitToHouse(houseId, "maintenance_updated", { type: "reported", issue });

    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get all maintenance issues for a house
// @route  GET /api/maintenance/house/:houseId
const getHouseIssues = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = { house: req.params.houseId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const issues = await Maintenance.find(filter)
      .populate("reportedBy", "name avatar")
      .populate("statusHistory.updatedBy", "name avatar")
      .sort({ priority: -1, createdAt: -1 });

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Update maintenance status
// @route  PUT /api/maintenance/:issueId/status
const updateStatus = async (req, res) => {
  try {
    const { status, note, cost } = req.body;
    const issue = await Maintenance.findById(req.params.issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.status = status;
    issue.statusHistory.push({ status, updatedBy: req.user._id, note: note || "" });
    
    if (status === "resolved") {
      issue.resolvedAt = new Date();
      
      // Auto-create expense if a valid cost is provided
      if (cost && Number(cost) > 0) {
        const House = require("../models/House");
        const Expense = require("../models/Expense");
        
        const house = await House.findById(issue.house);
        if (house && house.members.length > 0) {
          const splitAmount = parseFloat((Number(cost) / house.members.length).toFixed(2));
          const splits = house.members.map(m => ({
            user: m.user,
            amount: splitAmount,
            isPaid: m.user.toString() === req.user._id.toString(),
            paidAt: m.user.toString() === req.user._id.toString() ? new Date() : null
          }));
          
          await Expense.create({
            house: issue.house,
            title: `Maintenance: ${issue.title}`,
            totalAmount: Number(cost),
            category: "maintenance",
            paidBy: req.user._id,
            splitType: "equal",
            splits
          });
          
          issue.statusHistory.push({ 
            status: "expense_created", 
            updatedBy: req.user._id, 
            note: `Expense of ৳${cost} created` 
          });
        }
      }
    }

    await issue.save();
    emitToHouse(issue.house.toString(), "maintenance_updated", { type: "status_changed", issueId: issue._id, status: issue.status });

    res.json({ message: "Status updated", issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Delete a maintenance issue
// @route  DELETE /api/maintenance/:issueId
const deleteIssue = async (req, res) => {
  try {
    const issue = await Maintenance.findById(req.params.issueId);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    if (issue.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the reporter can delete this issue" });
    }

    await issue.deleteOne();
    res.json({ message: "Issue deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { reportIssue, getHouseIssues, updateStatus, deleteIssue };
