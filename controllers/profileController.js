const asyncHandler = require("express-async-handler");
const {
  getUserNotificationsAsync,
  markUserNotificationAsReadAsync,
} = require("../db/queries/notifications");
const { getUserByIdAsync } = require("../db/queries/users");
const CustomNotFoundError = require("../lib/errors/CustomNotFoundError");
const { getUserPostsAsync } = require("../db/queries/posts");

exports.GET = asyncHandler(async (req, res) => {
  const profileId = Number(req.params.id);
  const profileUser = await getUserByIdAsync(profileId);

  if (!profileUser) {
    throw new CustomNotFoundError("Profile not found.");
  }

  const isUserProfileOwner = profileId === Number(req.user.id);
  const title = isUserProfileOwner
    ? "Profile"
    : `Profile of ${profileUser.first_name} ${profileUser.last_name}`;

  const postsOfProfileUser = await getUserPostsAsync(profileId, 30);

  res.render("root", {
    title,
    mainView: "profile",
    profile: profileUser,
    isUserProfileOwner,
    posts: postsOfProfileUser,
    styles: "profile",
  });
});

exports.noitficationsGET = asyncHandler(async (req, res) => {
  const notifications = await getUserNotificationsAsync(req.user.id, 30);

  res.render("root", {
    title: "Notifications",
    mainView: "userNotifications",
    notifications,
  });
});

// try-catching cause we want errors to happen silently
exports.markNotificationAsReadSilentlyPOST = async (req, res) => {
  console.log(req.body);
  const notificationId = Number(req.body.notificationId);

  try {
    await markUserNotificationAsReadAsync(notificationId, req.user.id);
    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};
