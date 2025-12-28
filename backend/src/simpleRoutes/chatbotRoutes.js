const express = require('express');
const { getConversation, postMessage } = require('./chatbotController');
const { adminOrSeller } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/conversation', adminOrSeller, getConversation);
router.post('/message', adminOrSeller, postMessage);

module.exports = router;
