const Notice = require("../models/Notice");
const { emitToHouse } = require("../socket");

// @desc   Post a notice
// @route  POST /api/noticeboard
const postNotice = async (req, res) => {
  try {
    const { houseId, title, body, category, isPinned, expiresAt } = req.body;

    const notice = await Notice.create({
      house: houseId, title, body, category,
      isPinned: isPinned || false,
      expiresAt: expiresAt || null,
      postedBy: req.user._id
    });

    await notice.populate("postedBy", "name avatar");

    emitToHouse(houseId, "notice_posted", { notice });

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
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(notices);
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

    await notice.deleteOne();
    res.json({ message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { postNotice, getHouseNotices, togglePin, deleteNotice };
