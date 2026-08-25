const express = require("express");
const router  = express.Router();
const { 
  proposeRule, 
  voteOnRule, 
  finalizeRule, 
  getHouseRules, 
  deleteRule, 
  applyStarterPack, 
  nudgeRule 
} = require("../controllers/ruleController");
const { protect } = require("../middleware/authMiddleware");

router.post("/",                             protect, proposeRule);
router.get("/house/:houseId",                protect, getHouseRules);
router.post("/house/:houseId/starter-pack",  protect, applyStarterPack);
router.post("/:ruleId/nudge",                protect, nudgeRule);
router.post("/:ruleId/vote",                 protect, voteOnRule);
router.put("/:ruleId/finalize",              protect, finalizeRule);
router.delete("/:ruleId",                    protect, deleteRule);

module.exports = router;
