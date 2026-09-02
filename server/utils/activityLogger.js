const Activity = require("../models/Activity");
const { emitToHouse } = require("../socket");

/**
 * Log activity for a house and broadcast live via Socket.io
 * @param {string} houseId - ID of the house
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action identifier (e.g., "expense_added")
 * @param {string} message - Human readable message
 * @param {string} details - Additional details
 */
const logActivity = async (houseId, userId, action, message, details) => {
  console.log(`[Activity Logger] House: ${houseId} | User: ${userId} | Action: ${action} | Message: ${message} | Details: ${details}`);
  
  try {
    if (houseId && userId && action && message) {
      const activity = await Activity.create({
        house: houseId,
        user: userId,
        actionType: action,
        title: message,
        description: details || ""
      });

      const populated = await Activity.findById(activity._id).populate("user", "name avatar");

      if (emitToHouse) {
        emitToHouse(houseId.toString(), "activity_created", populated);
      }

      return populated;
    }
  } catch (err) {
    console.error("[Activity Logger Error]", err.message);
  }
};

module.exports = logActivity;
