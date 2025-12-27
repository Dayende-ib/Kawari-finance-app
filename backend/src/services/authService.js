const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const parseBearerToken = (authHeader) => {
  if (!authHeader) {
    throw new AppError('Missing authorization header', 401, 'UNAUTHORIZED');
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new AppError('Invalid authorization format', 401, 'UNAUTHORIZED');
  }

  return match[1].trim();
};

const verifyToken = (token) => {
  try {
    return verifyAccessToken(token);
  } catch (err) {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }
};

const loadUserById = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED');
  }
  return user;
};

module.exports = {
  parseBearerToken,
  verifyToken,
  loadUserById,
};
