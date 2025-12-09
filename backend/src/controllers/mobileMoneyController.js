// src/controllers/mobileMoneyController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

exports.mockTransaction = async (req, res, next) => {
  try {
    const { amount, currency, operator, customerId } = req.body;

    if (!req.user || !req.user.id) {
      return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
    }

    if (!amount || amount <= 0) {
      return next(new AppError('Amount must be greater than 0', 400, 'VALIDATION_ERROR'));
    }
    if (!currency) {
      return next(new AppError('Currency is required', 400, 'VALIDATION_ERROR'));
    }
    if (!operator) {
      return next(new AppError('Operator is required', 400, 'VALIDATION_ERROR'));
    }

    if (customerId) {
      const customerExists = await prisma.customer.findUnique({
        where: { id: customerId }
      });
      if (!customerExists) {
        return next(new AppError('Client introuvable. Verifie le customerId.', 400, 'VALIDATION_ERROR'));
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: 'sale',
        userId: req.user.id,
        customerId: customerId || null,
        amount,
        currency,
        date: new Date(),
        description: `Paiement Mobile Money via ${operator}`,
        paymentMethod: 'mobileMoney',
        category: 'mobile'
      },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        message: `Transaction Mobile Money: ${amount} ${currency} via ${operator}`,
        type: 'mobileMoney'
      },
    });

    return res.json(transaction);
  } catch (err) {
    logger.error('MobileMoney mock error', { error: err.message });
    return next(new AppError(err.message, 500));
  }
};

exports.getMobileMoneyHistory = async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        paymentMethod: "mobileMoney"
      },
      orderBy: {
        date: "desc"
      }
    });

    res.json(transactions);
  } catch (err) {
    logger.error('Erreur historique Mobile Money', { error: err.message });
    next(new AppError(err.message, 500));
  }
};
