const User = require("../models/User");
const { calculateCompatibility } = require("../utils/compatibilityAlgorithm");

// @desc   Get compatibility scores between current user and all housemates
// @route  GET /api/matching/house/:houseId
const getHouseCompatibility = async (req, res) => {
  try {
    const House = require("../models/House");
    const house = await House.findById(req.params.houseId).populate("members.user");
    if (!house) return res.status(404).json({ message: "House not found" });

    const currentUser = await User.findById(req.user._id);
    if (!currentUser.compatibilityProfile?.sleepSchedule) {
      return res.status(400).json({ message: "Complete your compatibility quiz first" });
    }

    const results = [];

    for (const member of house.members) {
      if (member.user._id.toString() === req.user._id.toString()) continue;
      if (!member.user.compatibilityProfile?.sleepSchedule) continue;

      const result = calculateCompatibility(
        currentUser.compatibilityProfile,
        member.user.compatibilityProfile
      );



      results.push({
        user: {
          _id:    member.user._id,
          name:   member.user.name,
          avatar: member.user.avatar
        },
        ...result
      });
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get compatibility score between two specific users
// @route  GET /api/matching/compare/:userId
const compareWithUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetUser  = await User.findById(req.params.userId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (!currentUser.compatibilityProfile?.sleepSchedule || !targetUser.compatibilityProfile?.sleepSchedule) {
      return res.status(400).json({ message: "Both users must complete the compatibility quiz" });
    }

    const result = calculateCompatibility(
      currentUser.compatibilityProfile,
      targetUser.compatibilityProfile
    );

    res.json({
      with: { _id: targetUser._id, name: targetUser.name, avatar: targetUser.avatar },
      ...result
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get overall house compatibility summary (bus factor style)
// @route  GET /api/matching/house/:houseId/summary
const getHouseSummary = async (req, res) => {
  try {
    const House = require("../models/House");
    const house = await House.findById(req.params.houseId).populate("members.user");
    if (!house) return res.status(404).json({ message: "House not found" });

    const membersWithProfiles = house.members.filter(
      m => m.user.compatibilityProfile?.sleepSchedule
    );

    if (membersWithProfiles.length < 2) {
      return res.json({ message: "Not enough members have completed the quiz", overallScore: null });
    }

    let totalScore = 0;
    let pairCount  = 0;
    const pairScores = [];

    for (let i = 0; i < membersWithProfiles.length; i++) {
      for (let j = i + 1; j < membersWithProfiles.length; j++) {
        const a = membersWithProfiles[i].user;
        const b = membersWithProfiles[j].user;
        const result = calculateCompatibility(a.compatibilityProfile, b.compatibilityProfile);
        


        totalScore += result.score;
        pairCount++;
        pairScores.push({ users: [a.name, b.name], score: result.score, label: result.label });
      }
    }

    const overallScore = Math.round(totalScore / pairCount);

    res.json({
      overallScore,
      label: overallScore >= 80 ? "Highly Compatible House"
           : overallScore >= 60 ? "Generally Compatible"
           : overallScore >= 40 ? "Some Friction Expected"
           : "High Conflict Risk",
      pairScores,
      membersWithoutQuiz: house.members.length - membersWithProfiles.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get recommended roommates (users looking for a house)
// @route  GET /api/matching/roommates
const getRecommendedRoommates = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser.compatibilityProfile?.sleepSchedule) {
      return res.status(400).json({ message: "Complete your compatibility quiz first" });
    }

    const { page = 1, limit = 10, gender, occupation, budgetMax } = req.query;

    const query = {
      currentHouse: null,
      "compatibilityProfile.sleepSchedule": { $exists: true },
      _id: { $ne: req.user._id }
    };

    if (gender) query.gender = gender;
    if (occupation) query.occupation = { $regex: occupation, $options: 'i' };
    if (budgetMax) query.budgetMax = { $lte: Number(budgetMax) };

    const freeAgents = await User.find(query).select("name avatar bio compatibilityProfile occupation gender budgetMax");

    let results = freeAgents.map(user => {
      const result = calculateCompatibility(
        currentUser.compatibilityProfile,
        user.compatibilityProfile
      );

      return {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        occupation: user.occupation,
        gender: user.gender,
        budgetMax: user.budgetMax,
        score: result.score,
        label: result.label,
        breakdown: result.breakdown
      };
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Manual Pagination after sorting
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedResults = results.slice(startIndex, endIndex);

    res.json({
      roommates: paginatedResults,
      currentPage: Number(page),
      totalPages: Math.ceil(results.length / Number(limit)),
      totalResults: results.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getHouseCompatibility, compareWithUser, getHouseSummary, getRecommendedRoommates };
