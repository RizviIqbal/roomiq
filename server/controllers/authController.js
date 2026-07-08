const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, occupation, bkashNumber } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, phone, occupation, bkashNumber });

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id:                 user._id,
      name:                user.name,
      email:               user.email,
      currentHouse:        user.currentHouse,
      compatibilityProfile: user.compatibilityProfile,
      token:               generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("currentHouse", "name address inviteCode");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/me
const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, avatar, occupation, bkashNumber } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, bio, avatar, occupation, bkashNumber },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Save compatibility quiz answers
// @route   PUT /api/auth/compatibility
const saveCompatibilityProfile = async (req, res) => {
  try {
    const profile = { ...req.body, completedAt: new Date() };
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { compatibilityProfile: profile },
      { new: true }
    );
    res.json({ message: "Compatibility profile saved", compatibilityProfile: user.compatibilityProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile, saveCompatibilityProfile };
