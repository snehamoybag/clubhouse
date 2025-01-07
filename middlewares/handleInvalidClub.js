const asyncHandler = require("express-async-handler");
const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");
const CustomNotFoundError = require("../lib/errors/CustomNotFoundError");
const { isClubValidAsync } = require("../db/queries/clubs");

module.exports = asyncHandler(async (req, res, next) => {
  const clubId = Number(req.params.id);

  if (!clubId) {
    throw new CustomBadRequestError("Invalid club id.");
  }

  const isClubValid = await isClubValidAsync(clubId);

  if (!isClubValid) {
    throw new CustomNotFoundError("Club not found.");
  }

  next();
});
