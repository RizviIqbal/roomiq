const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "roomiq_dev_default_secret_key_2026";
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "30d"
  });
};

module.exports = generateToken;
