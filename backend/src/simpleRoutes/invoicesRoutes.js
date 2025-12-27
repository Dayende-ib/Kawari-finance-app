const express = require('express');
const router = express.Router();
const ctrl = require('./invoicesController');
const auth = require('./authMiddlewareSimple');

router.get('/', auth, ctrl.list);
router.get('/:id', auth, ctrl.get);

module.exports = router;
