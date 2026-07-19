const express = require("express");
const router = express.Router();
const { getChatHistory, getConversations } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

// Route for pre-match communication inbox
router.get("/", protect, getConversations);
router.get("/:userId", protect, getChatHistory);

module.exports = router;
