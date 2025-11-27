const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');

const buildErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array();
  }
  return null;
};

const generateInvoiceNumber = () => {
  const now = new Date();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${rand}`;
};

const createTransaction = async (type, req, res) => {
  const errors = buildErrors(req);
  if (errors) {
    return res.status(400).json({ errors });
  }

  try {
    const transaction = await Transaction.create({
      ...req.body,
      type,
      createdBy: req.user._id,
    });

    let invoiceCreated = null;
    if (type === 'sale') {
      try {
        const saleAmount = req.body.amount;
        invoiceCreated = await Invoice.create({
          number: generateInvoiceNumber(),
          customerName: req.body.counterparty || 'Client',
          amount: saleAmount,
          items: [
            {
              description: req.body.description || 'Vente',
              quantity: 1,
              unitPrice: saleAmount,
              lineTotal: saleAmount,
            },
          ],
          dueDate: req.body.invoiceDueDate ? new Date(req.body.invoiceDueDate) : new Date(Date.now() + 7 * 86400000),
          status: 'paid',
          createdBy: req.user._id,
        });
      } catch (err) {
        // rollback sale if invoice fails to keep consistency
        await Transaction.findByIdAndDelete(transaction._id);
        throw err;
      }
    }

    return res.status(201).json({ transaction, invoice: invoiceCreated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la création' });
  }
};

exports.createSale = async (req, res) => createTransaction('sale', req, res);
exports.createExpense = async (req, res) => createTransaction('expense', req, res);

exports.listSales = async (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const items = await Transaction.find({ type: 'sale', createdBy: req.user._id })
    .sort({ date: -1 })
    .limit(limit);
  return res.json(items);
};

exports.listExpenses = async (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const items = await Transaction.find({ type: 'expense', createdBy: req.user._id })
    .sort({ date: -1 })
    .limit(limit);
  return res.json(items);
};

const updateTransaction = async (type, req, res) => {
  const { id } = req.params;
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: id, createdBy: req.user._id, type },
      { ...req.body },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Écriture introuvable' });
    }
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Impossible de mettre à jour' });
  }
};

const deleteTransaction = async (type, req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Transaction.findOneAndDelete({ _id: id, createdBy: req.user._id, type });
    if (!deleted) {
      return res.status(404).json({ message: 'Écriture introuvable' });
    }
    return res.json({ message: 'Supprimé' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Impossible de supprimer' });
  }
};

exports.updateSale = async (req, res) => updateTransaction('sale', req, res);
exports.deleteSale = async (req, res) => deleteTransaction('sale', req, res);
exports.updateExpense = async (req, res) => updateTransaction('expense', req, res);
exports.deleteExpense = async (req, res) => deleteTransaction('expense', req, res);

exports.createInvoice = async (req, res) => {
  const errors = buildErrors(req);
  if (errors) {
    return res.status(400).json({ errors });
  }
  try {
    const items = (req.body.items || []).map((it) => ({
      description: it.description,
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      lineTotal: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
    }));
    const computedAmount =
      items.length > 0 ? items.reduce((sum, it) => sum + it.lineTotal, 0) : Number(req.body.amount) || 0;

    const invoice = await Invoice.create({
      ...req.body,
      items,
      amount: computedAmount,
      createdBy: req.user._id,
    });
    return res.status(201).json(invoice);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de la création' });
  }
};

exports.listInvoices = async (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const items = await Invoice.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).limit(limit);
  return res.json(items);
};

exports.updateInvoiceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { status },
      { new: true }
    );
    if (!invoice) {
      return res.status(404).json({ message: 'Facture introuvable' });
    }
    return res.json(invoice);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Impossible de mettre à jour la facture' });
  }
};

exports.updateInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    let items;
    let amountUpdate;
    if (req.body.items) {
      items = req.body.items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        lineTotal: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      }));
      amountUpdate = items.reduce((sum, it) => sum + it.lineTotal, 0);
    }

    const updated = await Invoice.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { ...req.body, ...(items ? { items } : {}), ...(amountUpdate !== undefined ? { amount: amountUpdate } : {}) },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Facture introuvable' });
    }
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Impossible de mettre à jour la facture' });
  }
};

exports.deleteInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Invoice.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: 'Facture introuvable' });
    }
    return res.json({ message: 'Supprimé' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Impossible de supprimer la facture' });
  }
};

exports.dashboard = async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const aggregateTotal = async (match) => {
    const [result] = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result?.total || 0;
  };

  const monthlyBreakdown = async (type) => {
    const rows = await Transaction.aggregate([
      { $match: { createdBy: userId, type, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    return rows.map((row) => ({
      label: `${row._id.month}/${row._id.year}`,
      total: row.total,
    }));
  };

  try {
    const [totalSales, totalExpenses, monthlySales, monthlyExpenses, monthSales, monthExpenses] =
      await Promise.all([
        aggregateTotal({ createdBy: userId, type: 'sale' }),
        aggregateTotal({ createdBy: userId, type: 'expense' }),
        monthlyBreakdown('sale'),
        monthlyBreakdown('expense'),
        aggregateTotal({ createdBy: userId, type: 'sale', date: { $gte: monthStart } }),
        aggregateTotal({ createdBy: userId, type: 'expense', date: { $gte: monthStart } }),
      ]);

    const invoiceStats = await Invoice.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    return res.json({
      totals: {
        sales: totalSales,
        expenses: totalExpenses,
        cashFlow: totalSales - totalExpenses,
        monthSales,
        monthExpenses,
        monthCashFlow: monthSales - monthExpenses,
      },
      monthly: { sales: monthlySales, expenses: monthlyExpenses },
      invoices: invoiceStats,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors du calcul du tableau de bord' });
  }
};
