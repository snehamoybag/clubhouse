const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");
const CustomNotFoundError = require("../lib/errors/CustomNotFoundError");
const { isClubValidAsync } = require("../db/queries/clubs");

module.exports = async (req, res, next) => {
  const clubId = Number(req.params.id);

  if (!clubId) {
    return next(new CustomBadRequestError("Invalid club id."));
  }

  const isClubValid = await isClubValidAsync(clubId);

  if (!isClubValid) {
    return next(new CustomNotFoundError("Club not found."));
  }

  next();
};
