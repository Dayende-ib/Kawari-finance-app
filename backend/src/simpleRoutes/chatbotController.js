const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');

const getCompanyId = (req) => req.user?.companyId || req.user?.id;
const buildMatch = (req) =>
  req.user?.role === 'admin'
    ? { companyId: new mongoose.Types.ObjectId(getCompanyId(req)) }
    : { userId: new mongoose.Types.ObjectId(req.user.id) };

const fetchMetrics = async (match) => {
  const [txStats] = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: { $cond: [{ $eq: ['$type', 'sale'] }, '$amount', 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
      },
    },
  ]);

  const unpaidInvoices = await Invoice.countDocuments({
    ...match,
    status: { $nin: ['paid', 'PAID'] },
  });

  return {
    totalSales: txStats?.totalSales || 0,
    totalExpenses: txStats?.totalExpenses || 0,
    unpaidInvoices,
  };
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);

const buildGreeting = (user) => {
  const name = user?.name || ' ';
  if (user?.role === 'admin') return `Bonjour ${name}, je peux vous aider a suivre votre entreprise.`;
  if (user?.role === 'seller') return `Bonjour ${name}, je peux vous aider a suivre votre entreprise.`;
  return `Bonjour ${name}, je suis votre assistant financier.`;
};

const buildResponse = (message, metrics) => {
  const text = String(message || '').toLowerCase();
  const profit = metrics.totalSales - metrics.totalExpenses;

  if (text.includes('vente') || text.includes('sales') || text.includes('chiffre')) {
    return `Vos ventes totales sont de ${formatCurrency(metrics.totalSales)}.`;
  }
  if (text.includes('depense') || text.includes('expense')) {
    return `Vos dépenses totales sont de ${formatCurrency(metrics.totalExpenses)}.`;
  }
  if (text.includes('benefice') || text.includes('profit') || text.includes('marge')) {
    return `Votre bénéfice est de ${formatCurrency(profit)}.`;
  }
  if (text.includes('facture') || text.includes('impaye')) {
    return `Vous avez ${metrics.unpaidInvoices} facture(s) impayées.`;
  }

  return "Je peux vous aider avec vos ventes, dépenses, bénéfice ou factures impayées.";
};

exports.getConversation = async (req, res, next) => {
  try {
    res.json({ greeting: buildGreeting(req.user) });
  } catch (err) {
    next(err);
  }
};

exports.postMessage = async (req, res, next) => {
  try {
    const { message } = req.body || {};
    const metrics = await fetchMetrics(buildMatch(req));
    const response = buildResponse(message, metrics);
    res.json({ response });
  } catch (err) {
    next(err);
  }
};
