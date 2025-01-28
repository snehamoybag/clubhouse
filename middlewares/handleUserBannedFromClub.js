const { isUserBannedFromClubAsync } = require("../db/queries/clubs");
const CustomAccessDeniedError = require("../lib/errors/CustomAccessDeniedError");

module.exports = async (req, res, next) => {
  const clubId = Number(req.params.id);

  if (await isUserBannedFromClubAsync(clubId, req.user.id)) {
    next(new CustomAccessDeniedError("You've been banned from this club."));
  }

  next();
};
