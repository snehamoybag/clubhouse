const CustomAccessDeniedError = require("../lib/errors/CustomAccessDeniedError");

module.exports = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next(
      new CustomAccessDeniedError(
        "You do not have permission to access this resource.",
      ),
    );
  }

  next();
};
