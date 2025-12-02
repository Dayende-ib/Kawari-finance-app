const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');


const { 
    getAllSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
    getAllExpenses,
    getStatistics,
    getMonthlyStats,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense 
} = require('../controllers/transactionController');



// Sales
router.get('/sales', authMiddleware, getAllSales);
router.get('/sales/:id', authMiddleware, getSaleById);
router.post('/sales', authMiddleware, createSale);
router.put('/sales/:id', authMiddleware, updateSale);
router.delete('/sales/:id', authMiddleware, deleteSale);

// Expenses
router.get('/expenses', authMiddleware, getAllExpenses);
router.get('/expenses/:id', authMiddleware, getExpenseById);
router.post('/expenses', authMiddleware, createExpense);
router.put('/expenses/:id', authMiddleware, updateExpense);
router.delete('/expenses/:id', authMiddleware, deleteExpense);

// Statistics route could be added here
router.get('/stats', authMiddleware, getStatistics);


router.get('/monthly', authMiddleware, getMonthlyStats);


module.exports = router;
