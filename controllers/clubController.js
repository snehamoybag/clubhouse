const asyncHandler = require("express-async-handler");
const {
  getClubAsync,
  addClubAsync,
  addClubMemberAsync,
  assignClubRoleAdminAsync,
  getMemberClubRoleAsync,
  getNumberOfClubAdminsAsync,
  removeClubMemberAsync,
  updateClubInfoAsync,
  getClubJoinRequestsAsync,
  sendClubJoinRequestAsync,
  deleteClubJoinRequestAsync,
  isClubMemberAsync,
  addUserToClubBanListAsync,
  getClubBannedUsersAsync,
  removeUserFromClubBanListAsync,
} = require("../db/queries/clubs");
const { getPostsAsync } = require("../db/queries/posts");
const { getReportedPostsAsync } = require("../db/queries/reports");
const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");
const CustomNotFoundError = require("../lib/errors/CustomNotFoundError");
const CustomAccessDeniedError = require("../lib/errors/CustomAccessDeniedError");
const url = require("node:url");
const { getUserByIdAsync } = require("../db/queries/users");
const { sendNotificactionToUserAsync } = require("../db/queries/notifications");
const handlePostsPagination = require("../middlewares/handlePostsPagination");
const {
  nameValidations,
  aboutValidations,
  privacyValidations,
} = require("../validations/clubValidations");
const { validationResult } = require("express-validator");

exports.GET = [
  handlePostsPagination,
  asyncHandler(async (req, res) => {
    const clubId = Number(req.params.id);
    const club = await getClubAsync(clubId);

    const userId = req.user.id;
    const memberRole = await getMemberClubRoleAsync(clubId, userId);
    const posts = await getPostsAsync(clubId, 30, res.locals.postsCurrentPage);

    res.render("root", {
      mainView: "club",
      title: club.name,
      club,
      posts,
      memberRole,
      styles: "club",
    });
  }),
];

exports.joinClubPOST = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const club = await getClubAsync(clubId);

  if (club.privacy === "closed") {
    throw new CustomAccessDeniedError("Sorry club is closed, you cannot join.");
  }

  if (club.privacy === "invite-only") {
    await sendClubJoinRequestAsync(clubId, req.user.id);

    const redirectUrl = url.format({
      pathname: "/success/join-club-request-send",
      query: {
        clubId,
        clubName: club.name,
      },
    });

    res.redirect(redirectUrl);
    return;
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
    return;
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

const getCreateClubViewData = (fieldValues, errors) => ({
  title: "Create New Club",
  mainView: "newClub",
  fieldValues,
  errors,
});

exports.newClubGET = (req, res) => {
  res.render("root", getCreateClubViewData());
};

exports.newClubPOST = [
  nameValidations("name"),
  aboutValidations("about"),
  privacyValidations("privacy"),
  asyncHandler(async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res
        .status(422)
        .render(
          "root",
          getCreateClubViewData(req.body, validationErrors.mapped()),
        );
    }

    // add club and return the id of it
    const clubId = await addClubAsync(
      req.body.name,
      req.body.about,
      req.body.privacy,
    );

    await addClubMemberAsync(clubId, req.user.id);
    await assignClubRoleAdminAsync(clubId, req.user.id);

    res.redirect(`/club/${clubId}`);
  }),
];

const getEditClubViewDataAsync = async (clubId, fieldValues, errors) => ({
  title: "Edit Club",
  mainView: "editClub",
  fieldValues,
  errors,
  club: await getClubAsync(clubId),
});

exports.editClubGET = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  res.render("root", await getEditClubViewDataAsync(clubId));
});

exports.editClubPOST = [
  nameValidations("name"),
  aboutValidations("about"),
  privacyValidations("privacy"),
  asyncHandler(async (req, res) => {
    const validationErrors = validationResult(req);
    const clubId = Number(req.params.id);

    if (!validationErrors.isEmpty()) {
      return res
        .status(422)
        .render(
          "root",
          await getEditClubViewDataAsync(
            clubId,
            req.body,
            validationErrors.mapped(),
          ),
        );
    }

    await updateClubInfoAsync(
      clubId,
      req.body.name,
      req.body.about,
      req.body.privacy,
    );

    res.redirect("/success/edit/?type=Club&name=info");
  }),
];

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

exports.joinRequestsGET = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const joinRequests = await getClubJoinRequestsAsync(clubId, 30);

  res.render("root", {
    title: "Club Join Requests",
    mainView: "clubJoinRequests",
    clubId,
    joinRequests,
  });
});

exports.acceptClubJoinRequestPOST = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const senderId = Number(req.query.senderId);

  if (!(await getUserByIdAsync(senderId))) {
    await deleteClubJoinRequestAsync(clubId, senderId);
    throw new CustomNotFoundError("User not found.");
  }

  if (await isClubMemberAsync(clubId, senderId)) {
    await deleteClubJoinRequestAsync(clubId, senderId);
    throw new CustomBadRequestError("User aleady a member of this club.");
  }

  await addClubMemberAsync(clubId, senderId);
  await deleteClubJoinRequestAsync(clubId, senderId);

  const club = await getClubAsync(clubId);
  const clubLink = `/club/${clubId}`;
  const notficationMessage = `Congratulations! Your request to join '${club.name}' has been accepted.🥳`;

  await sendNotificactionToUserAsync(senderId, notficationMessage, clubLink);

  res.status(200).redirect(req.get("Referrer"));
});

exports.declineClubJoinRequestPOST = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const senderId = Number(req.query.senderId);

  if (!(await getUserByIdAsync(senderId))) {
    await deleteClubJoinRequestAsync(clubId, senderId);
    throw new CustomNotFoundError("User not found.");
  }

  await deleteClubJoinRequestAsync(clubId, senderId);

  const club = await getClubAsync(clubId);
  const clubLink = `/club/${clubId}`;
  const notficationMessage = `We are sorry, your request to join '${club.name}' has been declined.😥`;

  await sendNotificactionToUserAsync(senderId, notficationMessage, clubLink);

  res.status(200).redirect(req.get("Referrer"));
});

exports.reportedClubPostsGET = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);

  res.render("root", {
    title: "Reported Club Posts",
    mainView: "clubPostReports",
    clubId,
    reportedPosts: await getReportedPostsAsync(clubId, 30),
  });
});

exports.banListGET = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const bannedUsers = await getClubBannedUsersAsync(clubId, 30);

  res.render("root", {
    title: "Club's Ban List",
    mainView: "clubBanList",
    clubId,
    bannedUsers,
  });
});

exports.banUserPOST = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const userId = Number(req.query.userId);

  await addUserToClubBanListAsync(clubId, userId);
  await removeClubMemberAsync(clubId, userId);

  res.redirect(`/success/user-banned/?clubId=${clubId}`);
});

exports.removeUserBanPOST = asyncHandler(async (req, res) => {
  const clubId = Number(req.params.id);
  const userId = Number(req.query.userId);

  await removeUserFromClubBanListAsync(clubId, userId);

  res.status(200).redirect(`/club/${clubId}/control-panel/ban-list`);
});
