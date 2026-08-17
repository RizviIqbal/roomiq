const express = require("express");
const router = express.Router();
const { getActivities } = require("../controllers/activityController");
const { protect, requireHouseMember } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

router.get("/house/:houseId", requireHouseMember, getActivities);

module.exports = router;
