const express = require('express');
const router = express.Router();
const ctrl = require('./statsController');
const auth = require('./authMiddlewareSimple');

router.get('/', auth, ctrl.getStats);

module.exports = router;
