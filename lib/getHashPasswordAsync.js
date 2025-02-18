const bcrypt = require("bcryptjs");

module.exports = async (passwordString) => bcrypt.hash(passwordString, 10);
