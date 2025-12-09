const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, email: decoded.email };
    if (!req.user.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    logger.debug('Auth user', { userId: req.user.id });
    next();
  } catch (err) {
    logger.error('JWT verification failed', { error: err.message });
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
