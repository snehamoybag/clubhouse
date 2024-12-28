const asyncHandler = require("express-async-handler");
const {
  getClubAsync,
  addClubAsync,
  addClubMemberAsync,
  assignClubRoleAdminAsync,
  getNumberOfClubMembersAsync,
} = require("../db/queries/clubs");
const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");
const CustomNotFoundError = require("../lib/errors/CustomNotFoundError");

exports.GET = [
  asyncHandler(async (req, res) => {
    const clubId = Number(req.params.id);

    if (!clubId) {
      throw new CustomBadRequestError("Invalid club id: " + req.params.id);
    }

    const club = await getClubAsync(clubId);

    if (!club) {
      throw new CustomNotFoundError("Club not found.");
    }

    club.numberOfMembers = await getNumberOfClubMembersAsync(club.id);

    res.render("root", { mainView: "club", title: club.name, club: club });
  }),
];

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
