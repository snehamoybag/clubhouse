const asyncHandler = require("express-async-handler");
const {
  getUserNotificationsAsync,
  markUserNotificationAsReadAsync,
} = require("../db/queries/notifications");

exports.GET = (req, res) => {
  const user = req.user;

  res.render("root", {
    title: `Profile | ${user.first_name} ${user.last_name}`,
    mainView: "profile",
    profileId: req.params.id,
  });
};

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
