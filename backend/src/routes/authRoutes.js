const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');
const { registerSchema, loginSchema } = require('../validators/schemas');

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

module.exports = router;
