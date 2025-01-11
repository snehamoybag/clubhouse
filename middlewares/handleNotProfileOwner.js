const CustomAccessDeniedError = require("../lib/errors/CustomAccessDeniedError");

module.exports = (req, res, next) => {
  const profileId = Number(req.params.id);

  if (profileId !== res.locals.user.id) {
    return next(new CustomAccessDeniedError("You're not the profile owner."));
  }

  next();
};
