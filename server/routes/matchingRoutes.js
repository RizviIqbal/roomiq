const express = require("express");
const router  = express.Router();
const { getHouseCompatibility, compareWithUser, getHouseSummary, getRecommendedRoommates } = require("../controllers/matchingController");
const { protect } = require("../middleware/authMiddleware");

router.get("/house/:houseId",         protect, getHouseCompatibility);
router.get("/house/:houseId/summary", protect, getHouseSummary);
router.get("/compare/:userId",        protect, compareWithUser);
router.get("/roommates",              protect, getRecommendedRoommates);

module.exports = router;
