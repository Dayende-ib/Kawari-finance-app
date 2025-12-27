const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
