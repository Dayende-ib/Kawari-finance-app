const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { transactionCreateSchema, transactionUpdateSchema } = require('../validators/schemas');
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getStatistics,
  getMonthlyStats,
  getCategoryStats,
} = require('../controllers/transactionController');

router.get('/monthly', authMiddleware, getMonthlyStats);
router.get('/summary', authMiddleware, getStatistics);
router.get('/categories', authMiddleware, getCategoryStats);
router.get('/', authMiddleware, getTransactions);
router.get('/:id', authMiddleware, getTransactionById);
router.post('/', authMiddleware, validateRequest(transactionCreateSchema), createTransaction);
router.put('/:id', authMiddleware, validateRequest(transactionUpdateSchema), updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);

module.exports = router;
