const crypto = require("crypto");

const generateInviteCode = () => {
  // 8-character uppercase alphanumeric code e.g. "A3FX92KL"
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

module.exports = generateInviteCode;
