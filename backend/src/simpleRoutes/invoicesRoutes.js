const express = require('express');
const router = express.Router();
const ctrl = require('./invoicesController');
const auth = require('./authMiddlewareSimple');

router.get('/', auth, ctrl.list);
router.post('/', auth, ctrl.create);
router.get('/:id', auth, ctrl.get);
router.put('/:id', auth, ctrl.update);
router.get('/:id/versions', auth, ctrl.listVersions);
router.get('/:id/download', auth, ctrl.download);

module.exports = router;
