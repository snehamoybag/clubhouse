const asyncHandler = require("express-async-handler");
const {
  getClubAsync,
  addClubAsync,
  addClubMemberAsync,
  assignClubRoleAdminAsync,
  getMemberClubRoleAsync,
  getNumberOfClubAdminsAsync,
  removeClubMemberAsync,
  editClubNameAsync,
  editClubAboutAsync,
  editClubPrivacyAsync,
} = require("../db/queries/clubs");
const { getPostsAsync } = require("../db/queries/posts");
const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");
const CustomNotFoundError = require("../lib/errors/CustomNotFoundError");
const CustomAccessDeniedError = require("../lib/errors/CustomAccessDeniedError");
const url = require("node:url");
const handleInvalidClub = require("../middlewares/handleInvalidClub");

exports.GET = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const club = await getClubAsync(clubId);

  if (!club) {
    throw new CustomNotFoundError("Club not found.");
  }

  const userId = req.user.id;
  const memberRole = await getMemberClubRoleAsync(clubId, userId);
  const posts = await getPostsAsync(clubId, 30);

  res.render("root", {
    mainView: "club",
    title: club.name,
    club,
    posts,
    memberRole,
    styles: "club",
  });
});

exports.joinClubPOST = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const club = await getClubAsync(clubId);

  if (club.privacy === "closed") {
    throw new CustomAccessDeniedError("Sorry club is closed, you cannot join.");
  }

  if (club.privacy === "invite-only") {
    // TODO
  }

  if (club.privacy === "open") {
    await addClubMemberAsync(clubId, req.user.id);

    const redirectUrl = url.format({
      pathname: "/success/join-club/",
      query: {
        clubId,
        clubName: club.name,
      },
    });

    res.redirect(redirectUrl);
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

  const redirectUrl = url.format({
    pathname: "/success/leave-club/",
    query: {
      clubId: clubId,
    },
  });

  res.redirect(redirectUrl);
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

// TODO
exports.controlPanelGET = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const club = await getClubAsync(clubId);

  if (!club) {
    throw new CustomNotFoundError("Club not found.");
  }

  const userId = req.user.id;
  const memberRole = await getMemberClubRoleAsync(clubId, userId);

  if (memberRole !== "admin") {
    throw new CustomAccessDeniedError(
      "Only a club admin can access this page.",
    );
  }

  res.render("root", {
    title: `Control Panel | ${club.name}`,
    mainView: "clubControlPanel",
    club,
  });
});

exports.editClubNamePOST = [
  handleInvalidClub,
  asyncHandler(async (req, res) => {
    const clubId = Number(req.params.id);
    await editClubNameAsync(clubId, req.body.clubName);
    res.redirect("/success/edit/?type=club&name=name");
  }),
];

exports.editClubAboutPOST = [
  handleInvalidClub,
  asyncHandler(async (req, res) => {
    const clubId = Number(req.params.id);
    await editClubAboutAsync(clubId, req.body.clubAbout);
    res.redirect("/success/edit/?type=club&name=about");
  }),
];

exports.editClubPrivacyPOST = [
  handleInvalidClub,
  asyncHandler(async (req, res) => {
    const clubId = Number(req.params.id);
    await editClubPrivacyAsync(clubId, req.body.clubPrivacy);
    res.redirect("/success/edit/?type=club&name=privacy");
  }),
];
