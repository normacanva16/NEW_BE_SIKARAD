const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.getJwtSecret = () => {
  return process.env.SECRET;
};

exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET, { expiresIn: '24h' });
};

exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET);
  } catch {
    return false;
  }
};

exports.generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET, { expiresIn: '1w' });
};
