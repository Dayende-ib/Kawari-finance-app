const express = require('express');
const router = express.Router();
const ctrl = require('./transactionsController');
const auth = require('./authMiddlewareSimple');

router.get('/', auth, ctrl.list);
router.post('/', auth, ctrl.create);
router.get('/:id', auth, ctrl.get);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
