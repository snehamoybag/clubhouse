const asyncHandler = require("express-async-handler");
const {
  isPostValidAsync,
  isPostInClubAsync,
  getPostClubIdAsync,
  reportPostToClubAdminAsync,
  isPostAlreadyReportedByUserAsync,
} = require("../db/queries/posts");
const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");

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
