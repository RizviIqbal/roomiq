const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Must be used after protect middleware
const requireHouseMember = async (req, res, next) => {
  const House = require("../models/House");
  const houseId = req.params.houseId || req.body.houseId;
  const house = await House.findById(houseId);

  if (!house) return res.status(404).json({ message: "House not found" });

  const isMember = house.members.some(m => m.user.toString() === req.user._id.toString());
  if (!isMember) return res.status(403).json({ message: "Not a member of this house" });

  req.house = house;
  next();
};

const requireHouseAdmin = async (req, res, next) => {
  const House = require("../models/House");
  const houseId = req.params.houseId || req.body.houseId;
  const house = await House.findById(houseId);

  if (!house) return res.status(404).json({ message: "House not found" });

  const member = house.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member || member.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  req.house = house;
  next();
};

module.exports = { protect, requireHouseMember, requireHouseAdmin };
