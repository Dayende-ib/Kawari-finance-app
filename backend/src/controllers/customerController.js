const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');

exports.getAllCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        include: {
          transactions: {
            select: { amount: true, type: true }
          },
          invoices: {
            select: { total: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Calculer les statistiques pour chaque client
    const customersWithStats = customers.map(customer => {
      const totalSpent = customer.transactions
        .filter(tx => tx.type === 'sale')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const lastTransaction = customer.transactions.length > 0 
        ? new Date(Math.max(...customer.transactions.map(tx => new Date(tx.createdAt))))
        : null;

      return {
        ...customer,
        totalSpent,
        invoicesCount: customer.invoices.length,
        lastPurchase: lastTransaction ? lastTransaction.toISOString().split('T')[0] : null
      };
    });

    res.json({
      data: customersWithStats,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.getCustomerById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const customer = await prisma.customer.findUnique({ 
      where: { id: parseInt(id) },
      include: {
        transactions: {
          select: { amount: true, type: true, createdAt: true }
        },
        invoices: {
          select: { total: true }
        }
      }
    });
    
    if (!customer) return next(new AppError('Customer not found', 404, 'NOT_FOUND'));
    
    const totalSpent = customer.transactions
      .filter(tx => tx.type === 'sale')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const lastTransaction = customer.transactions.length > 0 
      ? new Date(Math.max(...customer.transactions.map(tx => new Date(tx.createdAt))))
      : null;

    const customerWithStats = {
      ...customer,
      totalSpent,
      invoicesCount: customer.invoices.length,
      lastPurchase: lastTransaction ? lastTransaction.toISOString().split('T')[0] : null
    };
    
    res.json(customerWithStats);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.createCustomer = async (req, res, next) => {
  const { name, phone, email } = req.body;
  try {
    const customer = await prisma.customer.create({ data: { name, phone, email } });
    res.json(customer);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.updateCustomer = async (req, res, next) => {
  const { id } = req.params;
  const { name, phone, email } = req.body;
  try {
    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: { name, phone, email },
    });
    res.json(customer);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.deleteCustomer = async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.customer.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
