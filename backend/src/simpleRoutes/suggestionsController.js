const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');

const getCompanyId = (req) => req.user?.companyId || req.user?.id;
const buildMatch = (req) =>
  req.user?.role === 'admin'
    ? { companyId: new mongoose.Types.ObjectId(getCompanyId(req)) }
    : { userId: new mongoose.Types.ObjectId(req.user.id) };

const buildSuggestion = (id, type, title, description, priority, icon) => ({
  id,
  type,
  title,
  description,
  priority,
  icon,
});

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

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [recentCount, unpaidInvoices, unreadNotifications] = await Promise.all([
    Transaction.countDocuments({ ...match, date: { $gte: since } }),
    Invoice.countDocuments({ ...match, status: { $nin: ['paid', 'PAID'] } }),
    Notification.countDocuments({ ...match, read: false }),
  ]);

  return {
    totalSales: txStats?.totalSales || 0,
    totalExpenses: txStats?.totalExpenses || 0,
    recentCount,
    unpaidInvoices,
    unreadNotifications,
  };
};

const buildSuggestions = (metrics) => {
  const suggestions = [];
  let id = 1;

  if (metrics.unpaidInvoices > 0) {
    suggestions.push(
      buildSuggestion(
        id++,
        'warning',
        'Factures en attente',
        `Vous avez ${metrics.unpaidInvoices} facture(s) en attente de paiement.`,
        'high',
        'AlertCircle'
      )
    );
  }

  if (metrics.totalSales === 0 && metrics.totalExpenses === 0) {
    suggestions.push(
      buildSuggestion(
        id++,
        'info',
        'Aucune transaction',
        'Commencez par enregistrer une vente ou une dépense.',
        'low',
        'Zap'
      )
    );
  } else if (metrics.totalExpenses > metrics.totalSales) {
    suggestions.push(
      buildSuggestion(
        id++,
        'warning',
        'Dépenses supérieures aux ventes',
        'Surveillez vos dépenses pour protéger la marge.',
        'high',
        'TrendingDown'
      )
    );
  } else if (metrics.totalSales > 0) {
    suggestions.push(
      buildSuggestion(
        id++,
        'success',
        'Ventes en progression',
        'Continuez vos efforts, vos ventes restent au-dessus des dépenses.',
        'medium',
        'TrendingUp'
      )
    );
  }

  if (metrics.recentCount === 0) {
    suggestions.push(
      buildSuggestion(
        id++,
        'info',
        'Activité récente faible',
        'Aucune transaction cette semaine. Pensez a relancer vos clients.',
        'medium',
        'BarChart3'
      )
    );
  }

  if (metrics.unreadNotifications > 0) {
    suggestions.push(
      buildSuggestion(
        id++,
        'info',
        'Notifications non lues',
        `Vous avez ${metrics.unreadNotifications} notification(s) non lues.`,
        'low',
        'Users'
      )
    );
  }

  return suggestions;
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const metrics = await fetchMetrics(buildMatch(req));
    res.json({ suggestions: buildSuggestions(metrics) });
  } catch (err) {
    next(err);
  }
};

exports.getAdminSuggestions = async (req, res, next) => {
  try {
    const metrics = await fetchMetrics(buildMatch(req));
    res.json({ suggestions: buildSuggestions(metrics) });
  } catch (err) {
    next(err);
  }
};
