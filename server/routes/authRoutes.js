const express = require("express");
const router  = express.Router();
const { register, login, getMe, updateProfile, saveCompatibilityProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register",     register);
router.post("/login",        login);
router.get("/me",            protect, getMe);
router.put("/me",            protect, updateProfile);
router.put("/compatibility", protect, saveCompatibilityProfile);

module.exports = router;
