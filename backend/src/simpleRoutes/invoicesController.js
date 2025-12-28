const Invoice = require('../models/Invoice');
const path = require('path');
const fs = require('fs/promises');
const puppeteer = require('puppeteer');
const { isValidObjectId } = require('../utils/validation');

const TEMPLATE_DIR = path.join(__dirname, '..', '..', 'templates');
const DEFAULT_TEMPLATE = 'invoice-default.html';

const escapeHtml = (value) => {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const normalizeTemplateName = (name) => {
  if (!name) return DEFAULT_TEMPLATE;
  const safe = String(name).toLowerCase().replace(/[^a-z0-9-_]/g, '');
  if (!safe || safe === 'default') return DEFAULT_TEMPLATE;
  return `invoice-${safe}.html`;
};

const renderTemplate = async ({ invoice, customer }) => {
  const templateName = normalizeTemplateName(invoice.templateName);
  const templatePath = path.join(TEMPLATE_DIR, templateName);
  let template;
  try {
    template = await fs.readFile(templatePath, 'utf-8');
  } catch (err) {
    template = await fs.readFile(path.join(TEMPLATE_DIR, DEFAULT_TEMPLATE), 'utf-8');
  }
  const number = invoice.number || invoice._id;
  const issuedAt = invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('fr-FR') : '';
  const dueAt = invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString('fr-FR') : '';
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const currency = 'XOF';

  const rows = items.length
    ? items
        .map((item) => {
          const qty = item.quantity || 0;
          const unit = item.unitPrice || 0;
          return `
      <tr>
        <td>${escapeHtml(item.label || '')}</td>
        <td>${qty}</td>
        <td>${unit}</td>
        <td>${qty * unit}</td>
      </tr>`;
        })
        .join('')
    : '<tr><td colspan="4">Aucun article</td></tr>';

  return template
    .replace(/{{invoiceNumber}}/g, escapeHtml(number))
    .replace(/{{issuedAt}}/g, escapeHtml(issuedAt))
    .replace(/{{dueAt}}/g, escapeHtml(dueAt))
    .replace(/{{customerName}}/g, escapeHtml(invoice.customerName || customer?.name || 'Client sans nom'))
    .replace(/{{customerEmail}}/g, escapeHtml(customer?.email || ''))
    .replace(/{{itemsRows}}/g, rows)
    .replace(/{{total}}/g, escapeHtml(invoice.total || 0))
    .replace(/{{currency}}/g, currency);
};


const getCompanyId = (req) => req.user?.companyId || req.user?.id;
const buildUserFilter = (req) =>
  req.user?.role === 'admin' ? { companyId: getCompanyId(req) } : { userId: req.user.id };

const normalizeSnapshot = (data) => ({
  customerName: data.customerName ? String(data.customerName).trim() : null,
  number: data.number || null,
  total: Number.isFinite(Number(data.total)) ? Number(data.total) : 0,
  issuedAt: data.issuedAt ? new Date(data.issuedAt).toISOString() : null,
  dueAt: data.dueAt ? new Date(data.dueAt).toISOString() : null,
  status: data.status || 'PENDING',
  templateName: data.templateName || 'default',
  items: Array.isArray(data.items)
    ? data.items.map((item) => ({
        label: item?.label || '',
        quantity: Number(item?.quantity || 0),
        unitPrice: Number(item?.unitPrice || 0),
      }))
    : [],
});

const hasInvoiceChanges = (current, update) => {
  const candidate = {
    customerName: Object.prototype.hasOwnProperty.call(update, 'customerName') ? update.customerName : current.customerName,
    number: Object.prototype.hasOwnProperty.call(update, 'number') ? update.number : current.number,
    total: Object.prototype.hasOwnProperty.call(update, 'total') ? update.total : current.total,
    issuedAt: Object.prototype.hasOwnProperty.call(update, 'issuedAt') ? update.issuedAt : current.issuedAt,
    dueAt: Object.prototype.hasOwnProperty.call(update, 'dueAt') ? update.dueAt : current.dueAt,
    status: Object.prototype.hasOwnProperty.call(update, 'status') ? update.status : current.status,
    templateName: Object.prototype.hasOwnProperty.call(update, 'templateName') ? update.templateName : current.templateName,
    items: Object.prototype.hasOwnProperty.call(update, 'items') ? update.items : current.items,
  };

  return JSON.stringify(normalizeSnapshot(current)) !== JSON.stringify(normalizeSnapshot(candidate));
};

exports.list = async (req, res, next) => {
  try {
    const rows = await Invoice.find(buildUserFilter(req))
      .sort({ issuedAt: -1 })
      .lean();
    res.json(rows);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { customerName, number, total, issuedAt, dueAt, status, items, templateName } = req.body;
    if (!customerName || !String(customerName).trim()) return res.status(400).json({ message: 'Customer name required' });
    if (total == null || !Number.isFinite(Number(total))) return res.status(400).json({ message: 'Invalid total' });

    const companyId = req.user?.companyId || req.user?.id;
    const invoice = await Invoice.create({
      companyId,
      userId: req.user.id,
      customerName: String(customerName).trim(),
      number: number || undefined,
      total: Number(total),
      issuedAt: issuedAt ? new Date(issuedAt) : new Date(),
      dueAt: dueAt ? new Date(dueAt) : null,
      status: status || 'PENDING',
      templateName: templateName || 'default',
      items: Array.isArray(items) ? items : [],
    });

    res.status(201).json(invoice);
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

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid invoice id' });

    const { customerName, number, total, issuedAt, dueAt, status, items, templateName } = req.body;
    const update = { updatedAt: new Date() };

    if (customerName !== undefined) update.customerName = customerName ? String(customerName).trim() : null;
    if (number !== undefined) update.number = number || null;
    if (total !== undefined) {
      if (!Number.isFinite(Number(total))) return res.status(400).json({ message: 'Invalid total' });
      update.total = Number(total);
    }
    if (issuedAt !== undefined) update.issuedAt = issuedAt ? new Date(issuedAt) : null;
    if (dueAt !== undefined) update.dueAt = dueAt ? new Date(dueAt) : null;
    if (status !== undefined) update.status = status || 'PENDING';
    if (templateName !== undefined) update.templateName = templateName || 'default';
    if (items !== undefined) update.items = Array.isArray(items) ? items : [];

    const current = await Invoice.findOne({ _id: id, ...buildUserFilter(req) }).lean();
    if (!current) return res.status(404).json({ message: 'Invoice not found' });

    if (!hasInvoiceChanges(current, update)) {
      return res.json(current);
    }

    const snapshot = {
      version: current.version || 1,
      customerName: current.customerName,
      number: current.number,
      total: current.total,
      issuedAt: current.issuedAt,
      dueAt: current.dueAt,
      status: current.status,
      templateName: current.templateName,
      items: current.items,
      createdAt: current.createdAt,
      updatedAt: current.updatedAt,
    };

    const nextVersion = (current.version || 1) + 1;

    const inv = await Invoice.findOneAndUpdate(
      { _id: id, ...buildUserFilter(req) },
      {
        $set: { ...update, version: nextVersion },
        $push: { versions: { version: snapshot.version, snapshot, createdAt: new Date() } },
      },
      { new: true }
    ).lean();
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    res.json(inv);
  } catch (err) { next(err); }
};

exports.download = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid invoice id' });
    const inv = await Invoice.findOne({ _id: id, ...buildUserFilter(req) }).lean();
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });

    const html = await renderTemplate({ invoice: inv, customer: inv.customerId });
    const filename = `facture-${inv.number || inv._id}.pdf`;

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } finally {
      await browser.close();
    }
  } catch (err) { next(err); }
};

exports.listVersions = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid invoice id' });
    const inv = await Invoice.findOne({ _id: id, ...buildUserFilter(req) }).lean();
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });

    const versions = Array.isArray(inv.versions) ? [...inv.versions].sort((a, b) => (b.version || 0) - (a.version || 0)) : [];
    res.json({ version: inv.version || 1, versions });
  } catch (err) { next(err); }
};
