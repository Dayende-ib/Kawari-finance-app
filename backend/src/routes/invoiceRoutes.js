const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
  invoiceCreateSchema,
  invoiceUpdateSchema,
} = require('../validators/schemas');
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');

router.use(authMiddleware);

router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.post('/', validateRequest(invoiceCreateSchema), createInvoice);
router.put('/:id', validateRequest(invoiceUpdateSchema), updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;
