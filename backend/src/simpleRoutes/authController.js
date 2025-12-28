const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { validatePassword, isValidObjectId } = require('../utils/validation');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const resolveCompanyId = (req) => req.user?.companyId || req.user?.id;
const buildRefreshPayload = (userId) => ({ userId, tokenId: randomUUID() });

const getRefreshCookieOptions = () => {
  const maxAge = Number.parseInt(process.env.JWT_REFRESH_MAX_AGE_MS || '', 10);
  const sameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
  const secureFromEnv = process.env.COOKIE_SECURE === 'true';
  const secure = secureFromEnv || process.env.NODE_ENV === 'production' || sameSite === 'none';
  const options = {
    httpOnly: true,
    sameSite,
    secure,
  };
  if (Number.isFinite(maxAge) && maxAge > 0) options.maxAge = maxAge;
  return options;
};

exports.register = async (req, res, next) => {
  try {
    const { name, companyName, email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password required', 400, 'VALIDATION_ERROR');
    if (!companyName) throw new AppError('Company name required', 400, 'VALIDATION_ERROR');
    if (!validatePassword(password)) throw new AppError('Password does not meet policy requirements', 400, 'WEAK_PASSWORD');

    const normalizedEmail = normalizeEmail(email);
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) throw new AppError('Email already exists', 400, 'EMAIL_EXISTS');

    const passwordHash = await hashPassword(password);
    const companyId = new mongoose.Types.ObjectId();
    const user = await User.create({
      _id: companyId,
      name: name || '',
      companyName: companyName || '',
      email: normalizedEmail,
      passwordHash,
      role: 'admin',
      companyId,
    });

    const accessToken = generateAccessToken({ userId: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken(buildRefreshPayload(user._id));

    const decoded = jwt.decode(refreshToken);
    await RefreshToken.create({ token: refreshToken, userId: user._id, expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null });

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
    res.json({
      user: {
        id: user._id,
        name: user.name,
        companyName: user.companyName,
        email: user.email,
        role: user.role,
      },
      token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.createSeller = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password required', 400, 'VALIDATION_ERROR');
    if (!validatePassword(password)) throw new AppError('Password does not meet policy requirements', 400, 'WEAK_PASSWORD');

    const normalizedEmail = normalizeEmail(email);
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) throw new AppError('Email already exists', 400, 'EMAIL_EXISTS');

    const companyId = resolveCompanyId(req);
    if (!companyId) throw new AppError('Company not found for admin', 400, 'COMPANY_NOT_FOUND');

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name: name || '',
      email: normalizedEmail,
      passwordHash,
      role: 'seller',
      companyId,
    });

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password required', 400, 'VALIDATION_ERROR');

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) throw new AppError('Invalid credentials', 400, 'INVALID_CREDENTIALS');

    const match = await comparePassword(password, user.passwordHash);
    if (!match) throw new AppError('Invalid credentials', 400, 'INVALID_CREDENTIALS');

    const accessToken = generateAccessToken({ userId: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken(buildRefreshPayload(user._id));
    const decoded = jwt.decode(refreshToken);
    await RefreshToken.create({ token: refreshToken, userId: user._id, expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null });

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
    res.json({
      user: {
        id: user._id,
        name: user.name,
        companyName: user.companyName,
        email: user.email,
        role: user.role,
      },
      token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.listSellers = async (req, res, next) => {
  try {
    const companyId = resolveCompanyId(req);
    if (!companyId) throw new AppError('Company not found for admin', 400, 'COMPANY_NOT_FOUND');

    const sellers = await User.find({ role: 'seller', companyId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      sellers.map((seller) => ({
        id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        createdAt: seller.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
};

exports.updateSeller = async (req, res, next) => {
  try {
    const sellerId = req.params.id;
    if (!isValidObjectId(sellerId)) throw new AppError('Invalid seller id', 400, 'VALIDATION_ERROR');

    const companyId = resolveCompanyId(req);
    if (!companyId) throw new AppError('Company not found for admin', 400, 'COMPANY_NOT_FOUND');

    const { name, email } = req.body;
    const update = {};
    if (name != null) update.name = name;
    if (email != null) update.email = normalizeEmail(email);

    if (update.email) {
      const exists = await User.findOne({ email: update.email, _id: { $ne: sellerId } });
      if (exists) throw new AppError('Email already exists', 400, 'EMAIL_EXISTS');
    }

    const seller = await User.findOneAndUpdate(
      { _id: sellerId, role: 'seller', companyId },
      update,
      { new: true }
    ).lean();

    if (!seller) throw new AppError('Seller not found', 404, 'NOT_FOUND');

    res.json({
      user: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        role: seller.role,
        createdAt: seller.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteSeller = async (req, res, next) => {
  try {
    const sellerId = req.params.id;
    if (!isValidObjectId(sellerId)) throw new AppError('Invalid seller id', 400, 'VALIDATION_ERROR');
    if (req.user?.id === sellerId) throw new AppError('Cannot delete your own account', 400, 'FORBIDDEN');

    const companyId = resolveCompanyId(req);
    if (!companyId) throw new AppError('Company not found for admin', 400, 'COMPANY_NOT_FOUND');

    const seller = await User.findOneAndDelete({ _id: sellerId, role: 'seller', companyId });
    if (!seller) throw new AppError('Seller not found', 404, 'NOT_FOUND');

    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const cookieToken = req.cookies && req.cookies.refreshToken;
    if (!cookieToken) throw new AppError('No refresh token', 401, 'UNAUTHORIZED');

    let payload;
    try { payload = verifyRefreshToken(cookieToken); } catch (e) { throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED'); }

    const stored = await RefreshToken.findOne({ token: cookieToken });
    if (!stored || stored.revoked) throw new AppError('Refresh token revoked or not found', 401, 'UNAUTHORIZED');

    const user = await User.findById(payload.userId);
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const newAccess = generateAccessToken({ userId: user._id, email: user.email, role: user.role });
    const newRefresh = generateRefreshToken(buildRefreshPayload(user._id));
    const decoded = jwt.decode(newRefresh);
    await RefreshToken.create({ token: newRefresh, userId: user._id, expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null });
    await RefreshToken.updateOne({ token: cookieToken }, { revoked: true, replacedBy: newRefresh });

    res.cookie('refreshToken', newRefresh, getRefreshCookieOptions());
    res.json({ token: newAccess });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const cookieToken = req.cookies && req.cookies.refreshToken;
    if (cookieToken) {
      await RefreshToken.updateOne({ token: cookieToken }, { revoked: true });
    }
    res.clearCookie('refreshToken', getRefreshCookieOptions());
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};
