const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { isValidObjectId } = require('../utils/validation');

const getCompanyId = (req) => req.user?.companyId || req.user?.id;
const buildUserFilter = (req) =>
  req.user?.role === 'admin' ? { companyId: getCompanyId(req) } : { userId: req.user.id };
const buildUserMatch = (req) =>
  req.user?.role === 'admin'
    ? { companyId: new mongoose.Types.ObjectId(getCompanyId(req)) }
    : { userId: new mongoose.Types.ObjectId(req.user.id) };

exports.list = async (req, res, next) => {
  try {
    const rows = await Transaction.find(buildUserFilter(req))
      .sort({ date: -1, _id: -1 })
      .lean();
    res.json(rows);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { customerName, type, amount, currency, date, description, paymentMethod, category } = req.body;
    if (!type || amount == null) return res.status(400).json({ message: 'Missing fields' });
    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue)) return res.status(400).json({ message: 'Invalid amount' });
    const parsedDate = date ? new Date(date) : new Date();
    if (date && Number.isNaN(parsedDate.getTime())) return res.status(400).json({ message: 'Invalid date' });

    const tx = await Transaction.create({
      companyId: getCompanyId(req),
      userId: req.user.id,
      customerName: customerName ? String(customerName).trim() : null,
      type,
      amount: amountValue,
      currency: currency || 'XOF',
      date: parsedDate,
      description: description || null,
      paymentMethod: paymentMethod || null,
      category: category || null,
    });
    res.status(201).json(tx);
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid transaction id' });
    const row = await Transaction.findOne({ _id: id, ...buildUserFilter(req) }).lean();
    if (!row) return res.status(404).json({ message: 'Transaction not found' });
    res.json(row);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid transaction id' });
    const row = await Transaction.findOneAndDelete({ _id: id, ...buildUserFilter(req) });
    if (!row) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid transaction id' });

    const { customerName, type, amount, currency, date, description, paymentMethod, category } = req.body;
    const update = { updatedAt: new Date() };

    if (type != null) update.type = type;
    if (amount != null) {
      const amountValue = Number(amount);
      if (!Number.isFinite(amountValue)) return res.status(400).json({ message: 'Invalid amount' });
      update.amount = amountValue;
    }
    if (currency != null) update.currency = currency;
    if (date != null) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) return res.status(400).json({ message: 'Invalid date' });
      update.date = parsedDate;
    }
    if (description !== undefined) update.description = description || null;
    if (paymentMethod !== undefined) update.paymentMethod = paymentMethod || null;
    if (category !== undefined) update.category = category || null;
    if (customerName !== undefined) update.customerName = customerName ? String(customerName).trim() : null;

    const row = await Transaction.findOneAndUpdate(
      { _id: id, ...buildUserFilter(req) },
      update,
      { new: true }
    ).lean();
    if (!row) return res.status(404).json({ message: 'Transaction not found' });
    res.json(row);
  } catch (err) { next(err); }
};

exports.monthly = async (req, res, next) => {
  try {
    const monthsParam = Number(req.query.months);
    const monthsCount = Number.isFinite(monthsParam) && monthsParam > 0
      ? Math.min(Math.floor(monthsParam), 24)
      : 6;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);
    const match = { ...buildUserMatch(req), date: { $gte: start, $lte: now } };

    const rows = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          type: '$_id.type',
          total: 1,
        },
      },
    ]);

    const monthKey = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const formatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
    const months = Array.from({ length: monthsCount }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
      return { key: monthKey(date), label: formatter.format(date) };
    });

    const indexByKey = new Map(months.map((month, index) => [month.key, index]));
    const monthlySales = months.map((month) => ({ month: month.label, total: 0 }));
    const monthlyExpenses = months.map((month) => ({ month: month.label, total: 0 }));

    for (const row of rows) {
      const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
      const index = indexByKey.get(key);
      if (index === undefined) continue;
      if (row.type === 'sale') monthlySales[index].total = row.total || 0;
      if (row.type === 'expense') monthlyExpenses[index].total = row.total || 0;
    }

    res.json({ monthlySales, monthlyExpenses });
  } catch (err) { next(err); }
};
