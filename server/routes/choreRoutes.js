const express = require("express");
const router  = express.Router();
const { createChore, getHouseChores, markDone, raiseDispute, resolveDispute, getChoreHistory } = require("../controllers/choreController");
const { protect } = require("../middleware/authMiddleware");

router.post("/",                        protect, createChore);
router.get("/house/:houseId",           protect, getHouseChores);
router.get("/house/:houseId/history",   protect, getChoreHistory);
router.put("/:choreId/done",            protect, markDone);
router.post("/:choreId/dispute",        protect, raiseDispute);
router.put("/:choreId/dispute/resolve", protect, resolveDispute);

module.exports = router;
