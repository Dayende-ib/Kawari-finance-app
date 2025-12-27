const Invoice = require('../models/Invoice');
const { isValidObjectId } = require('../utils/validation');

const getCompanyId = (req) => req.user?.companyId || req.user?.id;
const buildUserFilter = (req) =>
  req.user?.role === 'admin' ? { companyId: getCompanyId(req) } : { userId: req.user.id };

exports.list = async (req, res, next) => {
  try {
    const rows = await Invoice.find(buildUserFilter(req)).sort({ issuedAt: -1 }).lean();
    res.json(rows);
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid invoice id' });
    const inv = await Invoice.findOne({ _id: id, ...buildUserFilter(req) }).lean();
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    res.json(inv);
  } catch (err) { next(err); }
};
