const Rule = require("../models/Rule");
const House = require("../models/House");
const { emitToHouse } = require("../socket");
const logActivity = require("../utils/activityLogger");

// Preset Starter Constitution Packs
const STARTER_PACKS = {
  academic: [
    {
      title: "Quiet Hours (23:00 - 07:00)",
      description: "No loud speakers, gaming headsets required in common spaces after 23:00 to support study and sleep cycles.",
      category: "noise"
    },
    {
      title: "Zero-Dishes Left Overnight",
      description: "All cooking utensils and plates must be washed, dried, and put away within 2 hours of meal preparation.",
      category: "cleanliness"
    },
    {
      title: "24-Hour Notice for Overnight Guests",
      description: "Notify housemates in advance on the noticeboard before hosting friends overnight on weeknights.",
      category: "guests"
    }
  ],
  professional: [
    {
      title: "Clean Kitchen as You Cook",
      description: "Wipe counter tops, stoves, and microwave immediately after use to maintain shared culinary hygiene.",
      category: "kitchen"
    },
    {
      title: "Common Area Work-From-Home Respect",
      description: "Keep common living room quiet between 09:00 and 18:00 for roommates taking professional client calls.",
      category: "general"
    },
    {
      title: "Bathroom Shelf Organization & Dry Floor",
      description: "Wipe bathroom floors after showering and keep personal toiletries restricted to assigned vanity caddies.",
      category: "bathroom"
    }
  ],
  social: [
    {
      title: "Shared Common Room Entertainment Handoff",
      description: "Communal TV and gaming consoles are shared equally. Weekend social gatherings welcome with group consensus.",
      category: "general"
    },
    {
      title: "Label Personal Specialty Groceries",
      description: "Items on communal fridge shelves are open to all; private specialty groceries must have a name tag.",
      category: "kitchen"
    },
    {
      title: "Shared Weekend Cleanup Rotation",
      description: "Deep clean common spaces together for 30 minutes every Sunday morning before lunch.",
      category: "cleanliness"
    }
  ]
};

// @desc   Propose a new house rule
// @route  POST /api/rules
const proposeRule = async (req, res) => {
  try {
    const { houseId, title, description, category, votingDeadline } = req.body;

    const rule = await Rule.create({
      house:           houseId,
      title,
      description,
      category,
      proposedBy:      req.user._id,
      votingDeadline:  votingDeadline || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days default
      status:          "voting"
    });

    await rule.populate("proposedBy", "name avatar");

    emitToHouse(houseId, "rule_updated", { type: "proposed", rule });
    logActivity(houseId, req.user._id, "rule_proposed", `Proposed new house rule: ${title}`);

    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Apply a curated constitution starter pack
// @route  POST /api/rules/house/:houseId/starter-pack
const applyStarterPack = async (req, res) => {
  try {
    const { houseId } = req.params;
    const { packKey = "professional" } = req.body;

    const packRules = STARTER_PACKS[packKey] || STARTER_PACKS.professional;
    const createdRules = [];
    const now = new Date();

    for (const item of packRules) {
      const rule = await Rule.create({
        house: houseId,
        title: item.title,
        description: item.description,
        category: item.category,
        proposedBy: req.user._id,
        status: "active", // Starter pack is pre-enacted
        votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        approvedAt: now
      });
      await rule.populate("proposedBy", "name avatar");
      createdRules.push(rule);
    }

    emitToHouse(houseId, "rule_updated", { type: "starter_pack_applied", count: createdRules.length });
    logActivity(houseId, req.user._id, "rules_enacted", `Adopted ${packKey.toUpperCase()} House Constitution Starter Pack (${createdRules.length} rules)`);

    res.status(201).json({ message: `Successfully adopted ${createdRules.length} rules from the ${packKey} starter pack`, rules: createdRules });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Send a gentle anonymous/friendly nudge regarding an active rule
// @route  POST /api/rules/:ruleId/nudge
const nudgeRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.ruleId);
    if (!rule) return res.status(404).json({ message: "Rule not found" });

    emitToHouse(rule.house.toString(), "rule_nudge", {
      ruleId: rule._id,
      title: rule.title,
      category: rule.category,
      sentAt: new Date()
    });

    logActivity(rule.house.toString(), req.user._id, "rule_nudge", `Sent friendly reminder: ${rule.title}`);

    res.json({ message: "Friendly reminder sent to housemates" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Vote on a rule
// @route  POST /api/rules/:ruleId/vote
const voteOnRule = async (req, res) => {
  try {
    const { vote } = req.body; // "yes" or "no"
    const rule = await Rule.findById(req.params.ruleId);
    if (!rule) return res.status(404).json({ message: "Rule not found" });

    if (rule.status !== "voting") {
      return res.status(400).json({ message: "Voting is closed for this rule" });
    }

    if (new Date() > new Date(rule.votingDeadline)) {
      return res.status(400).json({ message: "Voting deadline has passed" });
    }

    // Remove existing vote from this user if any
    rule.votes = rule.votes.filter(v => v.user.toString() !== req.user._id.toString());
    rule.votes.push({ user: req.user._id, vote });

    await rule.save();
    emitToHouse(rule.house.toString(), "rule_updated", { type: "voted", ruleId: rule._id, yesCount: rule.yesCount, noCount: rule.noCount });

    res.json({ message: "Vote recorded", yesCount: rule.yesCount, noCount: rule.noCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Finalize rule voting (admin or auto after deadline)
// @route  PUT /api/rules/:ruleId/finalize
const finalizeRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.ruleId);
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    if (rule.status !== "voting") return res.status(400).json({ message: "Rule is not in voting state" });

    const yes = rule.votes.filter(v => v.vote === "yes").length;
    const no  = rule.votes.filter(v => v.vote === "no").length;

    rule.status = yes > no ? "active" : "rejected";
    if (rule.status === "active") rule.approvedAt = new Date();

    await rule.save();
    emitToHouse(rule.house.toString(), "rule_updated", { type: "finalized", ruleId: rule._id, status: rule.status });
    logActivity(rule.house.toString(), req.user._id, "rule_finalized", `Rule ${rule.status === "active" ? "Enacted" : "Rejected"}: ${rule.title}`);

    res.json({ message: `Rule ${rule.status}`, rule });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get all rules for a house
// @route  GET /api/rules/house/:houseId
const getHouseRules = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { house: req.params.houseId };
    if (status) filter.status = status;

    const rules = await Rule.find(filter)
      .populate("proposedBy", "name avatar")
      .populate("votes.user", "name avatar")
      .sort({ createdAt: -1 });

    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Delete a rule (admin or proposer while still voting)
// @route  DELETE /api/rules/:ruleId
const deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.ruleId);
    if (!rule) return res.status(404).json({ message: "Rule not found" });

    if (rule.proposedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the proposer can delete this rule" });
    }

    const houseId = rule.house.toString();
    await rule.deleteOne();

    emitToHouse(houseId, "rule_updated", { type: "deleted", ruleId: rule._id });

    res.json({ message: "Rule deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  proposeRule, 
  voteOnRule, 
  finalizeRule, 
  getHouseRules, 
  deleteRule, 
  applyStarterPack, 
  nudgeRule 
};
