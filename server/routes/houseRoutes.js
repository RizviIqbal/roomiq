const express = require("express");
const router  = express.Router();
const { createHouse, joinHouse, getHouse, updateHouse, removeMember, leaveHouse, transferAdmin, getPublicHouses } = require("../controllers/houseController");
const { protect, requireHouseAdmin } = require("../middleware/authMiddleware");

router.post("/",                           protect, createHouse);
router.post("/join",                       protect, joinHouse);
router.get("/public",                      protect, getPublicHouses);
router.get("/:houseId",                    protect, getHouse);
router.put("/:houseId",                    protect, requireHouseAdmin, updateHouse);
router.delete("/:houseId/members/:userId", protect, requireHouseAdmin, removeMember);
router.post("/:houseId/leave",             protect, leaveHouse);
router.put("/:houseId/transfer-admin",     protect, transferAdmin);

module.exports = router;
