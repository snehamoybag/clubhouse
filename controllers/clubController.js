const asyncHandler = require("express-async-handler");
const {
  getClubAsync,
  addClubAsync,
  addClubMemberAsync,
  assignClubRoleAdminAsync,
} = require("../db/queries/clubs");
const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");
const CustomNotFoundError = require("../lib/errors/CustomNotFoundError");
const { getPostsAsync } = require("../db/queries/posts");

exports.GET = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);

  if (!clubId) {
    throw new CustomBadRequestError("Invalid club id: " + req.params.id);
  }

  const club = await getClubAsync(clubId);

  if (!club) {
    throw new CustomNotFoundError("Club not found.");
  }

  const postsInClub = await getPostsAsync(clubId, 30);

  res.render("root", {
    mainView: "club",
    title: club.name,
    club,
    posts: postsInClub,
  });
});

exports.newClubGET = (req, res) => {
  res.render("root", { title: "Create New Club", mainView: "newClub" });
};

exports.newClubPOST = asyncHandler(async (req, res) => {
  // add club and return the id of it
  const clubId = await addClubAsync(
    req.body.name,
    req.body.about,
    req.body.privacy,
  );

  await addClubMemberAsync(clubId, req.user.id);
  await assignClubRoleAdminAsync(clubId, req.user.id);

  res.redirect(`/club/${clubId}`);
});
