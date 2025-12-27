const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const mongoose = require('mongoose');

const validatePassword = (password) => {
  return passwordPolicyRegex.test(password);
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

module.exports = { validatePassword, passwordPolicyRegex, isValidObjectId };
