const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const getType = (req) => {
  const type = (req.query.type || req.body.type || '').toLowerCase();
  if (type && type !== 'sale' && type !== 'expense') {
    throw new AppError('Invalid transaction type', 400, 'VALIDATION_ERROR');
  }
  return type;
};

exports.getTransactions = async (req, res, next) => {
  try {
    const type = getType(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (type) where.type = type;

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    // Filtrer les transactions invalides
    const validTransactions = transactions.filter(tx => tx && tx.type);
    
    res.json({
      data: validTransactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!tx || tx.userId !== req.user.id) return next(new AppError('Transaction not found', 404, 'NOT_FOUND'));
    
    // Vérifier que la transaction a un type valide
    if (!tx.type) {
      logger.warn('Transaction with missing type found', { transactionId: tx.id });
      return next(new AppError('Transaction has invalid format', 400, 'VALIDATION_ERROR'));
    }
    
    res.json(tx);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const type = getType(req) || req.body.type;
    if (!type) return next(new AppError('Transaction type is required', 400, 'VALIDATION_ERROR'));

    const { amount, currency, date, description, paymentMethod, category, customerId } = req.body;
    if (!amount || amount <= 0) return next(new AppError('Amount must be greater than 0', 400, 'VALIDATION_ERROR'));
    if (!date) return next(new AppError('Date is required', 400, 'VALIDATION_ERROR'));

    const tx = await prisma.transaction.create({
      data: {
        type,
        userId: req.user.id,
        customerId: customerId || null,
        amount,
        currency,
        date: new Date(date),
        description,
        paymentMethod,
        category,
      },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        message: `Nouvelle ${type === 'sale' ? 'vente' : 'dépense'} de ${amount} ${currency}`,
        type,
      },
    });

    res.json(tx);
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    if (req.body.amount && req.body.amount <= 0) {
      return next(new AppError('Amount must be greater than 0', 400, 'VALIDATION_ERROR'));
    }
    const tx = await prisma.transaction.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(tx);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    await prisma.transaction.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.getStatistics = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
  }

  try {
    const totalSales = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'sale', userId: req.user.id },
    });

    const totalExpenses = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'expense', userId: req.user.id },
    });

    const balance = (totalSales._sum.amount || 0) - (totalExpenses._sum.amount || 0);
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });
    const totalInvoices = await prisma.invoice.count({
      where: { userId: req.user.id },
    });
    const unpaidInvoices = await prisma.invoice.count({
      where: { userId: req.user.id, status: { in: ['pending', 'overdue'] } },
    });

    return res.json({
      totalSales: totalSales._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      balance,
      unreadNotifications: unreadCount,
      totalInvoices,
      unpaidInvoices,
    });
  } catch (err) {
    next(new AppError('Server error', 500));
  }
};

exports.getMonthlyStats = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
  }

  try {
    const userId = req.user.id;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: { in: ['sale', 'expense'] },
      },
      select: {
        type: true,
        amount: true,
        date: true,
      },
    });

    const monthlyMap = {};

    transactions.forEach((transaction) => {
      // Vérifier que la transaction est définie et a les propriétés nécessaires
      if (!transaction || !transaction.type || !transaction.amount || !transaction.date) {
        return; // ignorer cette transaction
      }
      
      const { type, amount, date } = transaction;
      const key = new Date(date).toLocaleString('default', { month: 'short', year: 'numeric' });

      if (!monthlyMap[key]) {
        monthlyMap[key] = { sale: 0, expense: 0 };
      }

      monthlyMap[key][type] += amount;
    });

    const monthlySales = [];
    const monthlyExpenses = [];

    Object.entries(monthlyMap).forEach(([month, values]) => {
      monthlySales.push({ month, total: values.sale });
      monthlyExpenses.push({ month, total: values.expense });
    });

    res.json({ monthlySales, monthlyExpenses });
  } catch (err) {
    next(new AppError('Server error', 500));
  }
};

exports.getCategoryStats = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
  }
  try {
    const userId = req.user.id;
    const categories = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where: { userId },
      _sum: { amount: true },
    });
    
    // S'assurer que les résultats sont valides
    const validCategories = categories.filter(cat => cat.type);
    res.json(validCategories);
  } catch (err) {
    next(new AppError('Server error', 500));
  }
};
