const asyncHandler = require("express-async-handler");
const { addPostAsync } = require("../db/queries/posts");

module.exports = asyncHandler(async (req, res, next) => {
  await addPostAsync(req.body.post, new Date(), Number(req.user.id));
  next();
});
