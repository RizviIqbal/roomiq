const express = require("express");
const router  = express.Router();
const { reportIssue, getHouseIssues, updateStatus, deleteIssue } = require("../controllers/maintenanceController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/",               protect, upload.single("photo"), reportIssue);
router.get("/house/:houseId",  protect, getHouseIssues);
router.put("/:issueId/status", protect, updateStatus);
router.delete("/:issueId",    protect, deleteIssue);

module.exports = router;
