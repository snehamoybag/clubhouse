const asyncHandler = require("express-async-handler");
const {
  addPostAsync,
  deletePostAsync,
  isPostAuthorAsync,
  editPostAsync,
} = require("../db/queries/posts");
const { getMemberClubRoleAsync } = require("../db/queries/clubs");
const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");

exports.addPOST = asyncHandler(async (req, res) => {
  const clubId = req.params.id ? Number(req.params.id) : null;

  await addPostAsync(req.body.post, new Date(), Number(req.user.id), clubId);
  res.redirect(req.get("Referrer") || "/"); // redirects back to the page where the request came from
});

exports.editPOST = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const postId = Number(req.params.postId);
  const message = req.body[`editPost${postId}`];
  console.log(message);

  const isPostAuthor = await isPostAuthorAsync(postId, userId);

  if (!isPostAuthor) {
    throw new CustomBadRequestError(
      "Only the post's author can edit this post.",
    );
  }

  await editPostAsync(postId, message);

  const url = `${req.get("Referrer")}#post${postId}`; // scrolls automatically to post's position
  res.status(200).redirect(url);
});

exports.deletePOST = asyncHandler(async (req, res) => {
  const postId = Number(req.query.postId);
  const clubId = Number(req.query.clubId);
  const userId = req.user.id;

  const clubRole = await getMemberClubRoleAsync(clubId, userId);
  const isAdminOrMod = clubRole === "admin" || clubRole === "mod";

  const isPostAuthor = await isPostAuthorAsync(postId, userId);

  if (!isAdminOrMod && !isPostAuthor) {
    throw new CustomBadRequestError(
      "Only the post's author or club admins/moderators can delete this post.",
    );
  }

  await deletePostAsync(postId);

  res.status(200).redirect(req.get("Referrer"));
});
