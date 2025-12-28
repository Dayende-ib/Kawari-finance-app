const AppError = require('../utils/AppError');

const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Le rôle doit être stocké dans le JWT ou en base
  // Pour maintenant, on va vérifier en base
  if (req.user.role !== 'admin') {
    return next(new AppError('Cette action est réservée aux administrateurs', 403, 'FORBIDDEN'));
  }

  next();
};

const superAdminOnly = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'super_admin') {
    return next(new AppError('Cette action est r\u00e9serv\u00e9e au super administrateur', 403, 'FORBIDDEN'));
  }

  next();
};

const sellerOnly = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'seller') {
    return next(new AppError('Cette action est réservée aux vendeurs', 403, 'FORBIDDEN'));
  }

  next();
};

const adminOrSeller = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'seller') {
    return next(new AppError('Accès non autorisé', 403, 'FORBIDDEN'));
  }

  next();
};

module.exports = { adminOnly, sellerOnly, adminOrSeller, superAdminOnly };
