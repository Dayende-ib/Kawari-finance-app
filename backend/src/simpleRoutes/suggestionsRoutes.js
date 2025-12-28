const express = require('express');
const { getSuggestions, getAdminSuggestions } = require('./suggestionsController');
const { adminOnly, adminOrSeller } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', adminOrSeller, getSuggestions);
router.get('/admin', adminOnly, getAdminSuggestions);

module.exports = router;
