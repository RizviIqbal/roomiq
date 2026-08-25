const express = require("express");
const router  = express.Router();
const { 
  postNotice, 
  getHouseNotices, 
  togglePin, 
  deleteNotice, 
  reactToNotice, 
  rsvpToNotice 
} = require("../controllers/noticeboardController");
const { protect } = require("../middleware/authMiddleware");

router.post("/",                protect, postNotice);
router.get("/house/:houseId",   protect, getHouseNotices);
router.put("/:noticeId/react",  protect, reactToNotice);
router.put("/:noticeId/rsvp",   protect, rsvpToNotice);
router.put("/:noticeId/pin",    protect, togglePin);
router.delete("/:noticeId",     protect, deleteNotice);

module.exports = router;
