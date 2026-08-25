const Notice = require("../models/Notice");
const { emitToHouse } = require("../socket");
const logActivity = require("../utils/activityLogger");

// @desc   Post a notice
// @route  POST /api/noticeboard
const postNotice = async (req, res) => {
  try {
    const { houseId, title, body, category, isPinned, expiresAt } = req.body;

    const notice = await Notice.create({
      house: houseId, 
      title, 
      body, 
      category: category || "general",
      isPinned: isPinned || false,
      expiresAt: expiresAt || null,
      postedBy: req.user._id,
      reactions: [],
      rsvps: []
    });

    await notice.populate("postedBy", "name avatar");

    emitToHouse(houseId, "notice_posted", { notice });
    logActivity(houseId, req.user._id, "notice_posted", `Posted bulletin: ${title}`);

    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get all notices for a house
// @route  GET /api/noticeboard/house/:houseId
const getHouseNotices = async (req, res) => {
  try {
    const now = new Date();
    const notices = await Notice.find({
      house: req.params.houseId,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
    })
      .populate("postedBy", "name avatar")
      .populate("reactions.user", "name avatar")
      .populate("rsvps.user", "name avatar")
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   React to a notice with an emoji
// @route  PUT /api/noticeboard/:noticeId/react
const reactToNotice = async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: "Emoji is required" });

    const notice = await Notice.findById(req.params.noticeId);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    const existingIndex = notice.reactions.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      if (notice.reactions[existingIndex].emoji === emoji) {
        // Toggle off
        notice.reactions.splice(existingIndex, 1);
      } else {
        // Switch emoji
        notice.reactions[existingIndex].emoji = emoji;
      }
    } else {
      notice.reactions.push({ user: req.user._id, emoji });
    }

    await notice.save();
    await notice.populate("postedBy", "name avatar");
    await notice.populate("reactions.user", "name avatar");
    await notice.populate("rsvps.user", "name avatar");

    emitToHouse(notice.house.toString(), "notice_updated", { notice });

    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   RSVP to an event notice
// @route  PUT /api/noticeboard/:noticeId/rsvp
const rsvpToNotice = async (req, res) => {
  try {
    const { status } = req.body; // "going" | "maybe" | "not_going"
    if (!status) return res.status(400).json({ message: "RSVP status is required" });

    const notice = await Notice.findById(req.params.noticeId);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    const existingIndex = notice.rsvps.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      if (notice.rsvps[existingIndex].status === status) {
        notice.rsvps.splice(existingIndex, 1); // remove
      } else {
        notice.rsvps[existingIndex].status = status;
      }
    } else {
      notice.rsvps.push({ user: req.user._id, status });
    }

    await notice.save();
    await notice.populate("postedBy", "name avatar");
    await notice.populate("reactions.user", "name avatar");
    await notice.populate("rsvps.user", "name avatar");

    emitToHouse(notice.house.toString(), "notice_updated", { notice });

    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Toggle pin on a notice (admin only)
// @route  PUT /api/noticeboard/:noticeId/pin
const togglePin = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.noticeId);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    notice.isPinned = !notice.isPinned;
    await notice.save();
    await notice.populate("postedBy", "name avatar");
    await notice.populate("reactions.user", "name avatar");
    await notice.populate("rsvps.user", "name avatar");

    emitToHouse(notice.house.toString(), "notice_updated", { notice });

    res.json({ message: `Notice ${notice.isPinned ? "pinned" : "unpinned"}`, notice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Delete a notice
// @route  DELETE /api/noticeboard/:noticeId
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.noticeId);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    if (notice.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the poster can delete this notice" });
    }

    const houseId = notice.house.toString();
    await notice.deleteOne();

    emitToHouse(houseId, "notice_deleted", { noticeId: notice._id });

    res.json({ message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  postNotice, 
  getHouseNotices, 
  togglePin, 
  deleteNotice, 
  reactToNotice, 
  rsvpToNotice 
};
