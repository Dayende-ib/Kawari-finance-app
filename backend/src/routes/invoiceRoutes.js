const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { 
    getAllInvoices,
    getInvoiceById, 
    createInvoice, 
    updateInvoice, 
    deleteInvoice } = require('../controllers/invoiceController');

router.use(authMiddleware);

router.get('/', getAllInvoices);           // GET /api/invoices
router.get('/:id', getInvoiceById);       // GET /api/invoices/:id
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;
