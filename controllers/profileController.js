const asyncHandler = require("express-async-handler");
const { getUserNotificationsAsync } = require("../db/queries/notifications");

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
