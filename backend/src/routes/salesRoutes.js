const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const transactionController = require('../controllers/transactionController');

router.use(authMiddleware);

// CRUD ventes
router.post('/', transactionController.createSale);
router.get('/', transactionController.getAllSales);
router.get('/:id', transactionController.getSaleById);
router.put('/:id', transactionController.updateSale);
router.delete('/:id', transactionController.deleteSale);

module.exports = router;
