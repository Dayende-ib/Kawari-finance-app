const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  company: user.company,
  address: user.address,
  logoUrl: user.logoUrl,
  signatureUrl: user.signatureUrl,
});

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
      user: userPayload(user),
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
      user: userPayload(user),
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
  return res.json({ user: userPayload(req.user) });
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = ['name', 'company', 'address', 'logoUrl', 'signatureUrl'].reduce((acc, key) => {
      if (req.body[key] !== undefined) acc[key] = req.body[key];
      return acc;
    }, {});
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    return res.json({ user: userPayload(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Impossible de mettre à jour le profil' });
  }
};
