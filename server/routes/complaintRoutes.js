const express = require("express");
const router  = express.Router();
const { fileComplaint, getHouseComplaints, mediationVote, resolveComplaint, getRepeatOffenders } = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");

router.post("/",                         protect, fileComplaint);
router.get("/house/:houseId",            protect, getHouseComplaints);
router.get("/house/:houseId/offenders",  protect, getRepeatOffenders);
router.post("/:complaintId/vote",        protect, mediationVote);
router.put("/:complaintId/resolve",      protect, resolveComplaint);

module.exports = router;
