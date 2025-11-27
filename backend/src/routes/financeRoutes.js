const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createSale,
  createExpense,
  listSales,
  listExpenses,
  updateSale,
  deleteSale,
  updateExpense,
  deleteExpense,
  createInvoice,
  listInvoices,
  updateInvoiceStatus,
  updateInvoice,
  deleteInvoice,
  dashboard,
} = require('../controllers/financeController');

const router = express.Router();

router.use(authMiddleware);

const transactionValidators = [
  body('amount').isNumeric().withMessage('Montant requis'),
  body('date').optional().isISO8601().withMessage('Date invalide'),
  body('category').optional().isString(),
  body('description').optional().isString(),
];

router.post('/sales', transactionValidators, createSale);
router.get('/sales', listSales);
router.put('/sales/:id', transactionValidators, updateSale);
router.delete('/sales/:id', deleteSale);

router.post('/expenses', transactionValidators, createExpense);
router.get('/expenses', listExpenses);
router.put('/expenses/:id', transactionValidators, updateExpense);
router.delete('/expenses/:id', deleteExpense);

router.post(
  '/invoices',
  [
    body('number').notEmpty().withMessage('Numéro requis'),
    body('customerName').notEmpty().withMessage('Nom du client requis'),
    body('amount').isNumeric(),
    body('dueDate').isISO8601(),
    body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue']),
  ],
  createInvoice
);
router.get('/invoices', listInvoices);
router.put(
  '/invoices/:id',
  [
    body('number').optional().notEmpty(),
    body('customerName').optional().notEmpty(),
    body('amount').optional().isNumeric(),
    body('dueDate').optional().isISO8601(),
    body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue']),
  ],
  updateInvoice
);
router.patch(
  '/invoices/:id/status',
  [body('status').isIn(['draft', 'sent', 'paid', 'overdue'])],
  updateInvoiceStatus
);
router.delete('/invoices/:id', deleteInvoice);

router.get('/dashboard', dashboard);

module.exports = router;
