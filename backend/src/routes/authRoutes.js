const express = require('express');
const { body } = require('express-validator');
const { register, login, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Nom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court'),
  ],
  register
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], login);

router.get('/me', authMiddleware, me);

module.exports = router;
