const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

/**
 * Middleware pour valider les requêtes entrantes
 * @param {Object} schema - Schéma de validation Joi
 * @returns {Function} Middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
        presence: 'required',
      });

      if (error) {
        const errorDetails = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
        }));

        logger.warn('Validation error', {
          path: req.path,
          method: req.method,
          errors: errorDetails,
        });

        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          errors: errorDetails,
        });
      }

      // Remplacer le body avec les valeurs validées et converties
      req.body = value;
      next();
    } catch (err) {
      logger.error('Validation middleware error', { error: err.message, stack: err.stack });
      next(new AppError('Internal validation error', 500, 'VALIDATION_INTERNAL_ERROR'));
    }
  };
};

/**
 * Middleware pour valider les paramètres de query
 * @param {Object} schema - Schéma de validation Joi
 * @returns {Function} Middleware function
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const errorDetails = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        return res.status(400).json({
          code: 'QUERY_VALIDATION_ERROR',
          message: 'Query validation failed',
          errors: errorDetails,
        });
      }

      req.query = value;
      next();
    } catch (err) {
      logger.error('Query validation middleware error', { error: err.message });
      next(new AppError('Internal validation error', 500, 'VALIDATION_INTERNAL_ERROR'));
    }
  };
};

/**
 * Middleware pour valider les paramètres d'URL (params)
 * @param {Object} schema - Schéma de validation Joi
 * @returns {Function} Middleware function
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const errorDetails = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        return res.status(400).json({
          code: 'PARAMS_VALIDATION_ERROR',
          message: 'URL parameters validation failed',
          errors: errorDetails,
        });
      }

      req.params = value;
      next();
    } catch (err) {
      logger.error('Params validation middleware error', { error: err.message });
      next(new AppError('Internal validation error', 500, 'VALIDATION_INTERNAL_ERROR'));
    }
  };
};

module.exports = { validateRequest, validateQuery, validateParams };
