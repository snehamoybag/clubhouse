const asyncHandler = require("express-async-handler");
const {
  addPostAsync,
  deletePostAsync,
  isPostAuthorAsync,
  editPostAsync,
  getPostAsync,
} = require("../db/queries/posts");
const { getMemberClubRoleAsync } = require("../db/queries/clubs");
const CustomAccessDeniedError = require("../lib/errors/CustomAccessDeniedError");
const { sendNotificactionToUserAsync } = require("../db/queries/notifications");

exports.addPOST = asyncHandler(async (req, res) => {
  const clubId = req.params.id ? Number(req.params.id) : null;

  await addPostAsync(req.body.post, new Date(), Number(req.user.id), clubId);
  res.redirect(req.get("Referrer") || "/"); // redirects back to the page where the request came from
});

exports.editPOST = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const postId = Number(req.params.id);
  const message = req.body[`editPost${postId}`];

  const isPostAuthor = await isPostAuthorAsync(postId, userId);

  if (!isPostAuthor) {
    throw new CustomAccessDeniedError(
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
    throw new CustomAccessDeniedError(
      "Only the post's author or club admins/moderators can delete this post.",
    );
  }

  // if deleted by admin or mod let the author of the post know
  if (isAdminOrMod && !isPostAuthor) {
    const post = await getPostAsync(postId);
    await sendNotificactionToUserAsync(
      Number(post.author_id),
      "We've deleted one of your post as it violates club's rules/guidelines.",
      `/club/${clubId}`,
    );
  }

  await deletePostAsync(postId);

  res.status(200).redirect(req.get("Referrer"));
});
