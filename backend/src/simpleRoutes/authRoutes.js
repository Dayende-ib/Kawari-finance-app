const express = require('express');
const router = express.Router();
const controller = require('./authController');
const auth = require('./authMiddlewareSimple');
const { adminOnly } = require('../middlewares/roleMiddleware');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh', controller.refreshToken);
router.post('/logout', controller.logout);
router.get('/sellers', auth, adminOnly, controller.listSellers);
router.post('/sellers', auth, adminOnly, controller.createSeller);
router.patch('/sellers/:id', auth, adminOnly, controller.updateSeller);
router.delete('/sellers/:id', auth, adminOnly, controller.deleteSeller);

module.exports = router;
