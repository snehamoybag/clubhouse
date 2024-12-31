const asyncHandler = require("express-async-handler");
const { addPostAsync } = require("../db/queries/posts");

exports.addPOST = asyncHandler(async (req, res) => {
  const clubId = req.params.id ? Number(req.params.id) : null;

  await addPostAsync(req.body.post, new Date(), Number(req.user.id), clubId);
  res.redirect(req.get("Referrer") || "/"); // redirects back to the page where the request came from
});
