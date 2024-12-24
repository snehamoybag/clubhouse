const CustomAccessDeniedError = require("../lib/errors/CustomAccessDeniedError");

module.exports = (req, res, next) => {
  if (!req.isAuthenticated()) {
    throw new CustomAccessDeniedError(
      "You do not have permission to access this page.",
    );
  }

  next();
};
