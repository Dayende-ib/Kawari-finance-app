const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AppError = require('../utils/AppError');

exports.getAllInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };
    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        include: { items: true },
        orderBy: { issuedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    res.json({
      data: invoices,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.getInvoiceById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { items: true } // pour inclure les items de la facture
    });
    if (!invoice || invoice.userId !== req.user.id) {
      return next(new AppError('Invoice not found', 404, 'NOT_FOUND'));
    }
    res.json(invoice);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.createInvoice = async (req, res, next) => {
  const { customerId, number, total, issuedAt, status, items } = req.body;
  
  // Validations
  if (!items || items.length === 0) {
    return next(new AppError("Invoice must have at least one item", 400, 'VALIDATION_ERROR'));
  }
  if (!total || total <= 0) {
    return next(new AppError("Total must be greater than 0", 400, 'VALIDATION_ERROR'));
  }
  if (!issuedAt || isNaN(new Date(issuedAt).getTime())) {
    return next(new AppError("Invalid issuedAt date", 400, 'VALIDATION_ERROR'));
  }
  try {
    const invoice = await prisma.invoice.create({
      data: {
        userId: req.user.id,
        customerId: customerId || null,
        number: number || `INV-${Date.now()}`,
        total,
        issuedAt: new Date(issuedAt),
        status:"pending",
        items: { create: items }
      },
      include: { items: true }
    });

    //  Notification automatique
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        message: `Nouvelle facture crÃ©Ã©e (#${invoice.number}) pour un total de ${total}`,
        type: "invoice"
      }
    });

    res.json(invoice);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};



exports.updateInvoice = async (req, res, next) => {
  const { id } = req.params;
  const { customerId, number, total, issuedAt, status, items } = req.body;
  if (!req.user || !req.user.id) {
    return next(new AppError('User not authenticated', 401, 'UNAUTHORIZED'));
  }

  try {
    // VÃ©rifie si la facture existe
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!existingInvoice) {
      return next(new AppError('Invoice not found', 404, 'NOT_FOUND'));
    }

    // Validations
    if (total && total <= 0) {
      return next(new AppError("Total must be greater than 0", 400, 'VALIDATION_ERROR'));
    }
    if (issuedAt && isNaN(new Date(issuedAt).getTime())) {
      return next(new AppError("Invalid issuedAt date", 400, 'VALIDATION_ERROR'));
    }

    // Mets Ã  jour les items existants (simplification : supprime et recrÃ©e)
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: parseInt(id) } });

    const updatedInvoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        customerId,
        number: number || existingInvoice.number,
        total: total || existingInvoice.total,
        issuedAt: issuedAt ? new Date(issuedAt) : existingInvoice.issuedAt,
        status: status || existingInvoice.status,
        items: { create: items || [] },
      },
      include: { items: true },
    });

    res.json(updatedInvoice);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exports.deleteInvoice = async (req, res, next) => {
  const { id } = req.params;

  try {
    // VÃ©rifie si la facture existe
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingInvoice || existingInvoice.userId !== req.user.id) {
      return next(new AppError('Invoice not found', 404, 'NOT_FOUND'));
    }

    // Supprime les items liÃ©s avant la facture
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: parseInt(id) } });

    // Supprime la facture
    await prisma.invoice.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
