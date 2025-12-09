const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'SERVER_ERROR';
  const message = err.message || 'Internal server error';

  logger.error('API error', { code, statusCode, message });

  res.status(statusCode).json({
    code,
    message,
  });
};

module.exports = errorHandler;
