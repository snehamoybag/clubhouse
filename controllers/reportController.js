const asyncHandler = require("express-async-handler");
const {
  isPostValidAsync,
  isPostInClubAsync,
  getPostClubIdAsync,
  getPostAsync,
  deletePostAsync,
} = require("../db/queries/posts");
const {
  reportPostToClubAdminAsync,
  isPostAlreadyReportedByUserAsync,
  deletePostFromReportedPostsAsync,
  getPostReporterIdsAsync,
} = require("../db/queries/reports");
const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");
const { sendNotificactionToUserAsync } = require("../db/queries/notifications");
const {
  addUserToClubBanListAsync,
  removeClubMemberAsync,
} = require("../db/queries/clubs");

const handleInvalidPostId = async (req, res, next) => {
  const postId = Number(req.query.postId);

  if (!(await isPostValidAsync(postId))) {
    return next(new CustomBadRequestError("Invalid post id."));
  }

  next();
};

exports.postGET = [
  handleInvalidPostId,
  asyncHandler(async (req, res) => {
    const postId = Number(req.query.postId);

    res.render("root", {
      title: "Report Post",
      mainView: "reportPost",
      isPostInClub: await isPostInClubAsync(postId),
    });
  }),
];

exports.postPOST = [
  handleInvalidPostId,
  asyncHandler(async (req, res) => {
    const postId = Number(req.query.postId);
    const reportedTo = req.body.reportTo;

    if (await isPostAlreadyReportedByUserAsync(postId, req.user.id)) {
      throw new CustomBadRequestError("You've already reported this post.");
    }

    if (reportedTo === "club") {
      const postClubId = await getPostClubIdAsync(postId);
      await reportPostToClubAdminAsync(postId, req.user.id, postClubId);
      res.redirect("/success/report/?type=post");
    } else if (reportedTo === "site") {
      // TODO: reprot to site admins
      res.redirect("/success/report/?type=post");
    } else {
      throw new CustomBadRequestError("Invalid report url.");
    }
  }),
];

exports.reviewPostGET = [
  handleInvalidPostId,
  asyncHandler(async (req, res) => {
    const reviewer = req.query.reviewer;
    const postId = Number(req.query.postId);
    const post = await getPostAsync(postId);

    switch (reviewer) {
      case "club":
        res.render("root", {
          title: "Review Post",
          mainView: "reviewPost",
          post,
          reviewer,
        });
        break;

      case "site":
        // TODO
        break;

      default:
        throw new CustomBadRequestError("Invalid reviewer.");
    }
  }),
];

const sendReviewNotificationToReportersAsync = (reporterIds, message, link) => {
  reporterIds.forEach(
    async (reporterId) =>
      await sendNotificactionToUserAsync(
        reporterId,
        `Report Review: ${message}`,
        link,
      ),
  );
};

exports.reviewPostPOST = [
  handleInvalidPostId,

  // when reviewer is club admin
  asyncHandler(async (req, res, next) => {
    if (req.query.reviewer !== "club") {
      return next();
    }

    const postId = Number(req.query.postId);
    const post = await getPostAsync(postId);
    const postAuthorId = Number(post.author_id);
    const postClubId = await getPostClubIdAsync(postId);
    const reporterIds = await getPostReporterIdsAsync(postId);

    switch (req.body.reviewAction) {
      case "ignore":
        await deletePostFromReportedPostsAsync(postId);

        sendReviewNotificationToReportersAsync(
          reporterIds,
          "We've decided not to remove the post you've reported earlier, as it does not violate club's rules/guidelines. Thankyou for your concerns.",
          `/post/${postId}`,
        );
        break;

      case "deletePost":
        await deletePostFromReportedPostsAsync(postId);
        await deletePostAsync(postId);

        sendReviewNotificationToReportersAsync(
          reporterIds,
          "W've decided to remove the post you've reported earlier as it violates club's rules/guidelines. Thankyou for reporting and making this community a better place.",
          postClubId ? `/club/${postClubId}` : "",
        );

        await sendNotificactionToUserAsync(
          postAuthorId,
          "We've decided to remove one of your post as it violates club's rules/guidlines. Please refrain from posting such messages in future, repeated violations can lead to ban.",
          postClubId ? `/club/${postClubId}` : "",
        );
        break;

      case "deletePostAndBanAuthor":
        await deletePostFromReportedPostsAsync(postId);
        await deletePostAsync(postId);

        await addUserToClubBanListAsync(postClubId, postAuthorId);
        await removeClubMemberAsync(postClubId, postAuthorId);

        sendReviewNotificationToReportersAsync(
          reporterIds,
          "We've decided to remove the post you've reported earlier as it violates our rules/guidlines. We've also banned the author for repeating such behaviors. Thankyou for reporting and making this community a better place.",
          postClubId ? `/club/${postClubId}` : "",
        );

        await sendNotificactionToUserAsync(
          postAuthorId,
          "You've been banned from the club for violating our rules/guidlines.",
          postClubId ? `/club/${postClubId}` : "",
        );
        break;

      default:
        throw new CustomBadRequestError("Invalid review action.");
    }

    await deletePostFromReportedPostsAsync(postId);
    res.status(200).end();
  }),

  // when the reviewer is site admin
  asyncHandler(async (req, res, next) => {
    if (req.query.reviewer !== "site") {
      return next();
    }
  }),

  // when reviewer is invalid
  (req, res, next) => {
    next(new CustomBadRequestError("Invalid reviewer."));
  },
];
