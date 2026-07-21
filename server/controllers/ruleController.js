const Rule = require("../models/Rule");
const { emitToHouse } = require("../socket");

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

    res.status(201).json(rule);
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

    await rule.deleteOne();
    res.json({ message: "Rule deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { proposeRule, voteOnRule, finalizeRule, getHouseRules, deleteRule };
