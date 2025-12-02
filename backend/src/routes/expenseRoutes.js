const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');



// CRUD dépenses
router.post('/', authMiddleware, transactionController.createExpense);
router.get('/', authMiddleware, transactionController.getAllExpenses);
router.get('/:id',authMiddleware, transactionController.getExpenseById);
router.put('/:id', authMiddleware, transactionController.updateExpense);
router.delete('/:id', authMiddleware, transactionController.deleteExpense);

module.exports = router;
