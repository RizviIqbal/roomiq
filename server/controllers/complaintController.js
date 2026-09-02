const Complaint = require("../models/Complaint");
const { emitToHouse } = require("../socket");
const logActivity = require("../utils/activityLogger");

// @desc   File a complaint
// @route  POST /api/complaints
const fileComplaint = async (req, res) => {
  try {
    const { houseId, against, title, description, category, isAnonymous } = req.body;

    // Check if this person is a repeat offender (3+ complaints in last 30 days)
    const recentCount = await Complaint.countDocuments({
      house:     houseId,
      against,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const complaint = await Complaint.create({
      house:       houseId,
      filedBy:     isAnonymous ? null : req.user._id,
      isAnonymous: isAnonymous || false,
      against,
      title,
      description,
      category,
      isRepeatOffense: recentCount >= 2,
      mediationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days to mediate
    });

    await complaint.populate("against", "name avatar");
    if (!isAnonymous) await complaint.populate("filedBy", "name avatar");

    emitToHouse(houseId, "complaint_updated", { type: "filed", complaint });
    logActivity(
      houseId,
      req.user._id,
      "complaint_filed",
      isAnonymous ? "Anonymous feedback submitted" : `Feedback submitted: ${title}`,
      `Category: ${category}`
    );

    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get all complaints for a house
// @route  GET /api/complaints/house/:houseId
const getHouseComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { house: req.params.houseId };
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter)
      .populate("against", "name avatar")
      .populate("filedBy", "name avatar")
      .populate("mediationVotes.voter", "name avatar")
      .sort({ createdAt: -1 });

    // Hide filedBy if anonymous
    const sanitized = complaints.map(c => {
      const obj = c.toObject();
      if (obj.isAnonymous) obj.filedBy = null;
      return obj;
    });

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Vote on complaint mediation
// @route  POST /api/complaints/:complaintId/vote
const mediationVote = async (req, res) => {
  try {
    const { verdict, comment } = req.body; // "valid" or "invalid"
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Can't vote on your own complaint or if you're the accused
    if (complaint.against.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot vote on a complaint against you" });
    }
    if (!complaint.isAnonymous && complaint.filedBy?.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot vote on your own complaint" });
    }

    // Remove existing vote
    complaint.mediationVotes = complaint.mediationVotes.filter(
      v => v.voter.toString() !== req.user._id.toString()
    );
    complaint.mediationVotes.push({ voter: req.user._id, verdict, comment });
    complaint.status = "under_mediation";

    await complaint.save();
    emitToHouse(complaint.house.toString(), "complaint_updated", { type: "voted", complaintId: complaint._id });

    res.json({ message: "Mediation vote recorded" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Resolve complaint (admin only)
// @route  PUT /api/complaints/:complaintId/resolve
const resolveComplaint = async (req, res) => {
  try {
    const { resolution, status } = req.body; // status: "resolved" or "dismissed"
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status     = status || "resolved";
    complaint.resolution = resolution || "";
    complaint.resolvedAt = new Date();

    await complaint.save();
    emitToHouse(complaint.house.toString(), "complaint_updated", { type: "resolved", complaintId: complaint._id, status: complaint.status });
    logActivity(
      complaint.house.toString(),
      req.user._id,
      "complaint_resolved",
      `Feedback ${complaint.status === "dismissed" ? "dismissed" : "resolved"}: ${complaint.title}`,
      resolution || ""
    );

    res.json({ message: "Complaint resolved", complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get repeat offenders in a house
// @route  GET /api/complaints/house/:houseId/offenders
const getRepeatOffenders = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      house:  req.params.houseId,
      status: { $ne: "dismissed" }
    }).populate("against", "name avatar");

    // Count per accused user
    const counts = {};
    for (const c of complaints) {
      const uid = c.against._id.toString();
      if (!counts[uid]) counts[uid] = { user: c.against, count: 0, categories: [] };
      counts[uid].count++;
      counts[uid].categories.push(c.category);
    }

    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { fileComplaint, getHouseComplaints, mediationVote, resolveComplaint, getRepeatOffenders };
