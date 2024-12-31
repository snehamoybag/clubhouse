const asyncHandler = require("express-async-handler");
const {
  getClubAsync,
  addClubAsync,
  addClubMemberAsync,
  assignClubRoleAdminAsync,
  isClubMemberAsync,
  getMemberClubRoleAsync,
  getNumberOfClubAdminsAsync,
  removeClubMemberAsync,
} = require("../db/queries/clubs");
const { getPostsAsync } = require("../db/queries/posts");
const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");
const CustomNotFoundError = require("../lib/errors/CustomNotFoundError");
const CustomAccessDeniedError = require("../lib/errors/CustomAccessDeniedError");

exports.GET = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const club = await getClubAsync(clubId);

  if (!club) {
    throw new CustomNotFoundError("Club not found.");
  }

  const isMember = await isClubMemberAsync(clubId, req.user.id);
  const postsInClub = await getPostsAsync(clubId, 30);

  res.render("root", {
    mainView: "club",
    title: club.name,
    club,
    isMember,
    posts: postsInClub,
  });
});

exports.joinClubPOST = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const club = await getClubAsync(clubId);

  if (club.privacy === "closed") {
    throw new CustomAccessDeniedError("Sorry club is closed, you cannot join.");
  }

  if (club.privacy === "invite-only") {
    // do something
  }

  if (club.privacy === "open") {
    await addClubMemberAsync(clubId, req.user.id);
    res.redirect(req.get("referer")); // back to club page
  }
});

exports.leaveClubPOST = asyncHandler(async (req, res) => {
  const [userId, clubId] = [req.user.id, Number(req.params.id)];
  const memberClubRole = await getMemberClubRoleAsync(clubId, userId);
  const numberOfClubAdmins = await getNumberOfClubAdminsAsync(clubId);

  if (memberClubRole === "admin" && numberOfClubAdmins === 1) {
    throw new CustomBadRequestError(
      "You are the only admin of this club, please assign a new admin before leaving this club.",
    );
  }

  await removeClubMemberAsync(clubId, userId);
  res.redirect("/success/leave-club");
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
