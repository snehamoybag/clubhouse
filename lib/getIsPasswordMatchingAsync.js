const bcrypt = require("bcryptjs");

module.exports = async (passwordString, passwordHash) => {
  return bcrypt.compare(passwordString, passwordHash);
};
