const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');

const getCompanyId = (req) => req.user?.companyId || req.user?.id;
const buildUserMatch = (req) =>
  req.user?.role === 'admin'
    ? { companyId: new mongoose.Types.ObjectId(getCompanyId(req)) }
    : { userId: new mongoose.Types.ObjectId(req.user.id) };

exports.getStats = async (req, res, next) => {
  try {
    const match = buildUserMatch(req);

    const [txStats] = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: {
              $cond: [{ $eq: ['$type', 'sale'] }, '$amount', 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
        },
      },
    ]);

    const totalSales = txStats?.totalSales || 0;
    const totalExpenses = txStats?.totalExpenses || 0;
    const balance = totalSales - totalExpenses;

    const [totalInvoices, unpaidInvoices, unreadNotifications] = await Promise.all([
      Invoice.countDocuments(match),
      Invoice.countDocuments({ ...match, status: { $nin: ['paid', 'PAID'] } }),
      Notification.countDocuments({ ...match, read: false }),
    ]);

    res.json({
      totalSales,
      totalExpenses,
      balance,
      unreadNotifications,
      totalInvoices,
      unpaidInvoices,
    });
  } catch (err) {
    next(err);
  }
};
