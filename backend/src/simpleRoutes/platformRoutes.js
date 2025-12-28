const express = require('express');
const router = express.Router();
const ctrl = require('./platformController');
const auth = require('./authMiddlewareSimple');
const { superAdminOnly } = require('../middlewares/roleMiddleware');

router.get('/companies', auth, superAdminOnly, ctrl.listCompanies);
router.get('/stats', auth, superAdminOnly, ctrl.getPlatformStats);
router.patch('/companies/:id/suspend', auth, superAdminOnly, ctrl.setCompanySuspended);

module.exports = router;
