const Customer = require('../models/Customer');
const { isValidObjectId } = require('../utils/validation');

const getCompanyId = (req) => req.user?.companyId || req.user?.id;
const buildUserFilter = (req) =>
  req.user?.role === 'admin' ? { companyId: getCompanyId(req) } : { userId: req.user.id };

exports.list = async (req, res, next) => {
  try {
    const rows = await Customer.find(buildUserFilter(req)).sort({ _id: -1 }).lean();
    res.json(rows);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const customer = await Customer.create({
      companyId: getCompanyId(req),
      userId: req.user.id,
      name,
      email: email || null,
      phone: phone || null,
    });
    res.status(201).json(customer);
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid customer id' });
    const row = await Customer.findOne({ _id: id, ...buildUserFilter(req) }).lean();
    if (!row) return res.status(404).json({ message: 'Customer not found' });
    res.json(row);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, email, phone } = req.body;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid customer id' });
    const row = await Customer.findOneAndUpdate(
      { _id: id, ...buildUserFilter(req) },
      { name, email, phone, updatedAt: new Date() },
      { new: true }
    ).lean();
    if (!row) return res.status(404).json({ message: 'Customer not found' });
    res.json(row);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid customer id' });
    const row = await Customer.findOneAndDelete({ _id: id, ...buildUserFilter(req) });
    if (!row) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
