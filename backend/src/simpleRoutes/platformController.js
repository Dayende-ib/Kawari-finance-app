const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { isValidObjectId } = require('../utils/validation');

exports.listCompanies = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      admins.map((admin) => ({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        companyId: admin.companyId || admin._id,
        suspended: !!admin.suspended,
        createdAt: admin.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
};

exports.getPlatformStats = async (req, res, next) => {
  try {
    const [txStats] = await Transaction.aggregate([
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

    const totalSales = txStats?.totalSales || 0;
    const totalExpenses = txStats?.totalExpenses || 0;
    const balance = totalSales - totalExpenses;

    const [totalCompanies, totalAdmins, totalSellers, totalInvoices, unpaidInvoices, unreadNotifications] =
      await Promise.all([
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'seller' }),
        Invoice.countDocuments({}),
        Invoice.countDocuments({ status: { $nin: ['paid', 'PAID'] } }),
        Notification.countDocuments({ read: false }),
      ]);

    res.json({
      totalCompanies,
      totalAdmins,
      totalSellers,
      totalSales,
      totalExpenses,
      balance,
      totalInvoices,
      unpaidInvoices,
      unreadNotifications,
    });
  } catch (err) {
    next(err);
  }
};

exports.setCompanySuspended = async (req, res, next) => {
  try {
    const companyId = req.params.id;
    if (!isValidObjectId(companyId)) throw new AppError('Invalid company id', 400, 'VALIDATION_ERROR');

    const { suspended } = req.body;
    if (typeof suspended !== 'boolean') throw new AppError('Suspended flag is required', 400, 'VALIDATION_ERROR');

    const admin = await User.findOneAndUpdate(
      { _id: companyId, role: 'admin' },
      { suspended },
      { new: true }
    ).lean();

    if (!admin) throw new AppError('Company not found', 404, 'NOT_FOUND');

    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      companyId: admin.companyId || admin._id,
      suspended: !!admin.suspended,
    });
  } catch (err) {
    next(err);
  }
};
