/**
 * Log activity for a house
 * @param {string} houseId - ID of the house
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action identifier (e.g., "expense_added")
 * @param {string} message - Human readable message
 * @param {string} details - Additional details
 */
const logActivity = (houseId, userId, action, message, details) => {
  console.log(`[Activity Logger] House: ${houseId} | User: ${userId} | Action: ${action} | Message: ${message} | Details: ${details}`);
  
  // NOTE: If an Activity model is added later, this can be expanded to save to the database.
};

module.exports = logActivity;
