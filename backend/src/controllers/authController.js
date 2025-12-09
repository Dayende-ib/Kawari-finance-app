const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { validatePassword } = require('../utils/validation');

exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return next(new AppError('Email already exists', 400, 'EMAIL_EXISTS'));
    if (!validatePassword(password)) return next(new AppError('Password does not meet complexity requirements', 400, 'WEAK_PASSWORD'));

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });

    const token = generateToken({ userId: user.id, email: user.email });
    res.json({ user, token });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(new AppError('Invalid credentials', 400, 'INVALID_CREDENTIALS'));
    if (!validatePassword(password)) return next(new AppError('Password does not meet complexity requirements', 400, 'WEAK_PASSWORD'));
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) return next(new AppError('Invalid credentials', 400, 'INVALID_CREDENTIALS'));

    const token = generateToken({ userId: user.id, email: user.email });
    res.json({ user, token });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
