const authService = require('../services/authService');
const User = require('../models/User');
const AppError = require('../utils/AppError');

module.exports = async (req, res, next) => {
  try {
    const token = authService.parseBearerToken(req.headers.authorization);
    const decoded = authService.verifyToken(token);
    const user = await authService.loadUserById(decoded.userId);
    if (user.role !== 'super_admin') {
      const companyId = user.companyId || user._id;
      if (user.role === 'admin' && user.suspended) {
        throw new AppError('Company suspended', 403, 'FORBIDDEN');
      }

      if (user.role === 'seller') {
        const company = await User.findById(companyId).lean();
        if (company?.suspended) {
          throw new AppError('Company suspended', 403, 'FORBIDDEN');
        }
      }
    }

    req.user = { id: user._id, email: user.email, role: user.role, companyId: user.companyId };
    return next();
  } catch (err) {
    return next(err);
  }
};
