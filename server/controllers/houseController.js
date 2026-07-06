const House = require("../models/House");
const User  = require("../models/User");
const generateInviteCode = require("../utils/generateInviteCode");

// @desc   Create a new house
// @route  POST /api/houses
const createHouse = async (req, res) => {
  try {
    const { name, address, totalRooms, monthlyRent, maxMembers, currency, isPublic, images } = req.body;

    let inviteCode;
    let codeExists = true;
    while (codeExists) {
      inviteCode = generateInviteCode();
      codeExists = await House.findOne({ inviteCode });
    }

    const house = await House.create({
      name, address, totalRooms, monthlyRent, maxMembers, currency,
      inviteCode, isPublic: !!isPublic, images: images || [],
      members: [{ user: req.user._id, role: "admin" }]
    });

    await User.findByIdAndUpdate(req.user._id, { currentHouse: house._id });

    res.status(201).json(house);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Join house via invite code
// @route  POST /api/houses/join
const joinHouse = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const house = await House.findOne({ inviteCode });
    if (!house) return res.status(404).json({ message: "Invalid invite code" });
    if (!house.isActive) return res.status(400).json({ message: "This house is no longer active" });

    const alreadyMember = house.members.some(m => m.user.toString() === req.user._id.toString());
    if (alreadyMember) return res.status(400).json({ message: "You are already a member of this house" });

    if (house.members.length >= house.maxMembers) {
      return res.status(400).json({ message: "House is full" });
    }

    house.members.push({ user: req.user._id, role: "member" });
    await house.save();

    await User.findByIdAndUpdate(req.user._id, { currentHouse: house._id });

    res.json({ message: "Joined house successfully", house });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get house details with populated members
// @route  GET /api/houses/:houseId
const getHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.houseId)
      .populate("members.user", "name email avatar phone bio occupation bkashNumber compatibilityProfile");

    if (!house) return res.status(404).json({ message: "House not found" });

    const isMember = house.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: "Not a member of this house" });

    res.json(house);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Update house details (admin only)
// @route  PUT /api/houses/:houseId
const updateHouse = async (req, res) => {
  try {
    const { name, address, totalRooms, monthlyRent, maxMembers, currency } = req.body;
    const house = await House.findByIdAndUpdate(
      req.params.houseId,
      { name, address, totalRooms, monthlyRent, maxMembers, currency },
      { new: true }
    );
    res.json(house);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Remove a member (admin only)
// @route  DELETE /api/houses/:houseId/members/:userId
const removeMember = async (req, res) => {
  try {
    const house = await House.findById(req.params.houseId);
    if (!house) return res.status(404).json({ message: "House not found" });

    const targetId = req.params.userId;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: "Admin cannot remove themselves. Transfer admin role first." });
    }

    house.members = house.members.filter(m => m.user.toString() !== targetId);
    await house.save();

    await User.findByIdAndUpdate(targetId, { currentHouse: null });

    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Leave house
// @route  POST /api/houses/:houseId/leave
const leaveHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.houseId);
    if (!house) return res.status(404).json({ message: "House not found" });

    const member = house.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member) return res.status(400).json({ message: "You are not a member" });

    if (member.role === "admin" && house.members.length > 1) {
      return res.status(400).json({ message: "Transfer admin role before leaving" });
    }

    house.members = house.members.filter(m => m.user.toString() !== req.user._id.toString());
    if (house.members.length === 0) house.isActive = false;
    await house.save();

    await User.findByIdAndUpdate(req.user._id, { currentHouse: null });

    res.json({ message: "Left house successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Transfer admin role
// @route  PUT /api/houses/:houseId/transfer-admin
const transferAdmin = async (req, res) => {
  try {
    const { newAdminId } = req.body;
    const house = await House.findById(req.params.houseId);

    const currentAdmin = house.members.find(m => m.user.toString() === req.user._id.toString());
    if (!currentAdmin || currentAdmin.role !== "admin") {
      return res.status(403).json({ message: "Only admin can transfer role" });
    }

    house.members = house.members.map(m => {
      if (m.user.toString() === req.user._id.toString()) m.role = "member";
      if (m.user.toString() === newAdminId) m.role = "admin";
      return m;
    });

    await house.save();
    res.json({ message: "Admin role transferred" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get public houses with compatibility scores
// @route  GET /api/houses/public
const getPublicHouses = async (req, res) => {
  try {
    const { calculateCompatibility } = require("../utils/compatibilityAlgorithm");

    const { search, rentMax, roomsMin, page = 1, limit = 10 } = req.query;

    const query = { 
      isActive: true, 
      isPublic: true,
      $expr: { $lt: [{ $size: "$members" }, "$maxMembers"] }
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    if (rentMax) query.monthlyRent = { $lte: Number(rentMax) };
    if (roomsMin) query.totalRooms = { $gte: Number(roomsMin) };

    const houses = await House.find(query)
      .populate("members.user", "name avatar compatibilityProfile")
      .lean();

    const currentUser = await User.findById(req.user._id);
    if (!currentUser.compatibilityProfile?.sleepSchedule) {
      return res.status(400).json({ message: "Complete your compatibility quiz first" });
    }

    const results = houses.map(house => {
      let totalScore = 0;
      let validMembers = 0;
      let adminId = null;

      house.members.forEach(m => {
        if (m.role === 'admin') adminId = m.user._id;
        if (m.user.compatibilityProfile?.sleepSchedule) {
          const res = calculateCompatibility(currentUser.compatibilityProfile, m.user.compatibilityProfile);
          totalScore += res.score;
          validMembers++;
        }
      });

      const avgScore = validMembers > 0 ? Math.round(totalScore / validMembers) : null;

      return {
        _id: house._id,
        name: house.name,
        address: house.address,
        monthlyRent: house.monthlyRent,
        currency: house.currency,
        totalRooms: house.totalRooms,
        memberCount: house.members.length,
        maxMembers: house.maxMembers,
        adminId,
        images: house.images || [],
        compatibilityScore: avgScore,
        compatibilityLabel: avgScore ? (avgScore >= 80 ? "Highly Compatible" : avgScore >= 60 ? "Generally Compatible" : avgScore >= 40 ? "Some Friction" : "High Conflict") : "Not enough data"
      };
    });

    // Sort by compatibility score (descending), nulls at the end
    results.sort((a, b) => {
      if (a.compatibilityScore === null) return 1;
      if (b.compatibilityScore === null) return -1;
      return b.compatibilityScore - a.compatibilityScore;
    });

    // Manual Pagination after sorting
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedResults = results.slice(startIndex, endIndex);

    res.json({
      houses: paginatedResults,
      currentPage: Number(page),
      totalPages: Math.ceil(results.length / Number(limit)),
      totalResults: results.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createHouse, joinHouse, getHouse, updateHouse, removeMember, leaveHouse, transferAdmin, getPublicHouses };
