const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");

module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(
      new CustomBadRequestError(
        "No need you're already a member of Clubhouse.",
      ),
    );
  }

  next();
};
