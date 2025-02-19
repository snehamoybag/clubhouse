const { isUserBannedFromClubAsync } = require("../db/queries/clubs");
const CustomAccessDeniedError = require("../lib/errors/CustomAccessDeniedError");

module.exports = async (req, res, next) => {
  const clubId = Number(req.params.id);

  // make sure params is actually club id
  if (!clubId) {
    return next();
  }

  if (await isUserBannedFromClubAsync(clubId, req.user.id)) {
    return next(
      new CustomAccessDeniedError("You've been banned from this club."),
    );
  }

  next();
};
