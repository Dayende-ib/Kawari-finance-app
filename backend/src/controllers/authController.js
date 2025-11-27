const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, company } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email' });
    }

    const user = await User.create({ name, email, password, company });
    return res.status(201).json({
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, company: user.company },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const valid = await user.matchPassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    return res.json({
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, company: user.company },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.me = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Non autorisé' });
  }
  return res.json({ user: req.user });
};
