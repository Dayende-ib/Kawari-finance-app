const logger = require('../utils/logger');

/**
 * Middleware de gestion centralisée des erreurs
 * Tous les contrôleurs doivent passer les erreurs à next()
 */
const errorHandler = (err, req, res, next) => {
  // Déterminer le code d'erreur et le statut
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details = undefined;

  // Si c'est un AppError (erreur métier)
  if (err.statusCode && err.code) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }
  // Erreurs de validation Joi
  else if (err.isJoi || (err.details && Array.isArray(err.details))) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = err.details;
  }
  // Erreurs Prisma
  else if (typeof err.code === 'string' && err.code.startsWith('P')) {
    statusCode = 400;
    code = 'DATABASE_ERROR';
    message = 'Database operation failed';
    
    // Codes Prisma spécifiques
    if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    } else if (err.code === 'P2002') {
      code = 'UNIQUE_CONSTRAINT_VIOLATION';
      message = 'This value already exists';
    } else if (err.code === 'P2014') {
      code = 'FOREIGN_KEY_CONSTRAINT_FAILED';
      message = 'Cannot perform this operation due to related records';
    }
    
    if (process.env.NODE_ENV !== 'production') {
      details = { prismaCode: err.code, meta: err.meta };
    }
  }
  // Erreurs standard Node.js
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }
  // Autres erreurs
  else {
    statusCode = err.status || 500;
    message = err.message || 'Internal server error';
  }

  // Logger l'erreur avec contexte complet
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('API Error', {
    code,
    statusCode,
    message,
    path: req?.originalUrl || req?.url || 'unknown',
    method: req?.method || 'unknown',
    userId: req?.user?.id || undefined,
    userRole: req?.user?.role || undefined,
    details: details || err.details,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    originalError: process.env.NODE_ENV !== 'production' ? err.message : undefined,
  });

  // Répondre avec un format uniforme
  res.status(statusCode).json({
    code,
    message,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
    ...(process.env.NODE_ENV !== 'production' && { trace: err.stack }),
  });
};

module.exports = errorHandler;
