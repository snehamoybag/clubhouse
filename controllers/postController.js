const asyncHandler = require("express-async-handler");
const {
  addPostAsync,
  deletePostAsync,
  isPostAuthorAsync,
  editPostAsync,
  getPostAsync,
  likePostAsync,
  unlikePostAsync,
} = require("../db/queries/posts");
const { getMemberClubRoleAsync } = require("../db/queries/clubs");
const CustomAccessDeniedError = require("../lib/errors/CustomAccessDeniedError");
const { sendNotificactionToUserAsync } = require("../db/queries/notifications");
const CustomBadRequestError = require("../lib/errors/CustomBadRequestError");
const CustomNotFoundError = require("../lib/errors/CustomNotFoundError");

exports.GET = asyncHandler(async (req, res) => {
  const postId = Number(req.params.id);
  const post = await getPostAsync(req.user.id, postId);

  if (!post) {
    throw new CustomNotFoundError("Post not found.");
  }

  const title =
    post.message.length > 50
      ? post.message.substring(0, 50) + "..."
      : post.message;

  res.render("root", {
    title,
    post,
    mainView: "post",
    styles: "post-page",
  });
});

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
    const post = await getPostAsync(userId, postId);
    await sendNotificactionToUserAsync(
      Number(post.author_id),
      "We've deleted one of your post as it violates club's rules/guidelines.",
      `/club/${clubId}`,
    );
  }

  await deletePostAsync(postId);

  res.status(200).render("root", {
    title: "Post Deleted!",
    message: "The post message has been deleted successfully.",
    redirectText: "Return to homepage",
    redirectLink: "/",
    mainView: "success",
  });
});

exports.likePOST = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const postId = Number(req.params.postId);

  const post = await getPostAsync(userId, postId);

  if (!post) {
    throw new CustomBadRequestError("Invalid post.");
  }

  if (post.is_liked_by_user) {
    await unlikePostAsync(userId, postId);
  } else {
    await likePostAsync(userId, postId);

    // send notification to post author
    if (userId !== post.author_id) {
      await sendNotificactionToUserAsync(
        post.author_id,
        `${req.user.first_name} ${req.user.last_name} has liked one of your post.`,
        `/post/${post.id}`,
      );
    }
  }

  const scrollToPostUrl = `${req.get("referrer")}#post${postId}`;
  res.status(200).redirect(scrollToPostUrl);
});
