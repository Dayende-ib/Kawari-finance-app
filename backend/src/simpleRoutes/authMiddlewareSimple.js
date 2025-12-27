const authService = require('../services/authService');

module.exports = async (req, res, next) => {
  try {
    const token = authService.parseBearerToken(req.headers.authorization);
    const decoded = authService.verifyToken(token);
    const user = await authService.loadUserById(decoded.userId);
    req.user = { id: user._id, email: user.email, role: user.role, companyId: user.companyId };
    return next();
  } catch (err) {
    return next(err);
  }
};
