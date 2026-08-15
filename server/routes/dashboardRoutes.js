const express = require("express");
const router = express.Router();
const { getDashboardData } = require("../controllers/dashboardController");
const { protect, requireHouseMember } = require("../middleware/authMiddleware");

// All dashboard routes are protected and require the user to be a house member
router.get("/house/:houseId", protect, requireHouseMember, getDashboardData);

module.exports = router;
