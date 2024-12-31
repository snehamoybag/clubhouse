const asyncHandler = require("express-async-handler");
const { getAllClubsAsync } = require("../db/queries/clubs");

exports.GET = asyncHandler(async (req, res) => {
  const clubs = await getAllClubsAsync(30);

  res.render("root", { title: "List of clubs", mainView: "clubsList", clubs });
});
