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
    const { name, phone, bio, avatar, occupation, gender, budgetMax, bkashNumber, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new password" });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      user.password = newPassword;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (occupation !== undefined) user.occupation = occupation;
    if (gender !== undefined) user.gender = gender;
    if (budgetMax !== undefined) user.budgetMax = budgetMax ? Number(budgetMax) : null;
    if (bkashNumber !== undefined) user.bkashNumber = bkashNumber;

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("currentHouse", "name address inviteCode totalRooms monthlyRent");
    res.json(updatedUser);
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
