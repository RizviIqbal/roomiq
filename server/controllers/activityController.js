const Activity = require("../models/Activity");

// @desc   Get paginated activities for a house
// @route  GET /api/activities/house/:houseId
const getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const houseId = req.params.houseId;
    
    // Calculate skip based on page and limit
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch activities, populated with user info
    const activities = await Activity.find({ house: houseId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination metadata
    const total = await Activity.countDocuments({ house: houseId });

    res.json({
      activities,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalActivities: total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getActivities };
