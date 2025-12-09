const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const validatePassword = (password) => {
  return passwordPolicyRegex.test(password);
};

module.exports = { validatePassword, passwordPolicyRegex };
