const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { mockTransaction } = require('../controllers/mobileMoneyController');

router.post('/mock', authMiddleware, mockTransaction);
router.get('/history' , authMiddleware, require('../controllers/mobileMoneyController').getMobileMoneyHistory);

module.exports = router;
