const asyncHandler = require("express-async-handler");
const {
  getUserNotificationsAsync,
  markUserNotificationAsReadAsync,
} = require("../db/queries/notifications");
const {
  getUserByIdAsync,
  updateUserNameAsync,
  updateUserEmailAsync,
  updateUserPasswordAsync,
  updateUserBioAsync,
} = require("../db/queries/users");
const CustomNotFoundError = require("../lib/errors/CustomNotFoundError");
const { getUserPostsAsync } = require("../db/queries/posts");
const {
  nameValidations,
  currentEmailValidations,
  emailValidations,
  confirmEmailValidations,
  passwordValidations,
  currentPasswordValidations,
  confirmPasswordValidations,
  bioValidations,
} = require("../validations/uservalidations");
const { validationResult } = require("express-validator");

(exports.GET = asyncHandler(async (req, res) => {
  const profileId = Number(req.params.id);
  const profileUser = await getUserByIdAsync(profileId);

  if (!profileUser) {
    throw new CustomNotFoundError("Profile not found.");
  }

  const isUserProfileOwner = profileId === Number(req.user.id);
  const title = isUserProfileOwner
    ? "Profile"
    : `Profile of ${profileUser.first_name} ${profileUser.last_name}`;

  const pageSize = 10;
  const pageNum = Number(req.query.page) || 1;

  const postsOfProfileUser = await getUserPostsAsync(
    profileId,
    pageSize,
    pageNum,
  );

  res.render("root", {
    title,
    mainView: "profile",
    profile: profileUser,
    isUserProfileOwner,
    posts: postsOfProfileUser,
    pagination: {
      page: pageNum,
      pageSize,
    },
    styles: "profile",
  });
})),
  (exports.noitficationsGET = asyncHandler(async (req, res) => {
    const notifications = await getUserNotificationsAsync(req.user.id, 30);

    res.render("root", {
      title: "Notifications",
      mainView: "userNotifications",
      notifications,
    });
  }));

// try-catching cause we want errors to happen silently on client side
exports.markNotificationAsReadSilentlyPOST = async (req, res) => {
  const notificationId = Number(req.body.notificationId);

  try {
    await markUserNotificationAsReadAsync(notificationId, req.user.id);
    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

exports.setttingsGET = (req, res) => {
  res.render("root", {
    title: "Profile Setttings",
    mainView: "profileSettings",
  });
};

const getEditNameViewData = (fieldValues, errors) => ({
  title: "Edit Name",
  mainView: "editUserName",
  fieldValues,
  errors,
});

exports.editNameGET = (req, res) => {
  res.render("root", getEditNameViewData());
};

exports.editNamePOST = [
  nameValidations("firstName"),
  nameValidations("lastName"),
  asyncHandler(async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      res
        .status(422)
        .render(
          "root",
          getEditNameViewData(req.body, validationErrors.mapped()),
        );
      return;
    }

    const { firstName, lastName } = req.body;

    await updateUserNameAsync(req.user.id, firstName, lastName);

    res.redirect(`/success/edit/?type=Profile&name=name`);
  }),
];

const getEditEmailViewData = (fieldValues, errors) => ({
  title: "Edit Email",
  mainView: "editEmail",
  fieldValues,
  errors,
});

exports.editEmailGET = (req, res) => {
  res.render("root", getEditEmailViewData());
};

exports.editEmailPOST = [
  currentEmailValidations("currentEmail"),
  emailValidations("newEmail"),
  confirmEmailValidations("newEmail", "confirmNewEmail"),
  asyncHandler(async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      res
        .status(422)
        .render(
          "root",
          getEditEmailViewData(req.body, validationErrors.mapped()),
        );
      return;
    }

    await updateUserEmailAsync(req.user.id, req.body.newEmail);

    res.redirect("/success/edit/?type=Profile&name=email");
  }),
];

const getEditPasswordViewData = (fieldValues, errors) => ({
  title: "Edit Password",
  mainView: "editPassword",
  fieldValues,
  errors,
});

exports.editPasswordGET = (req, res) => {
  res.render("root", getEditPasswordViewData());
};

exports.editPasswordPOST = [
  currentPasswordValidations("currentPassword"),
  passwordValidations("newPassword"),
  confirmPasswordValidations("newPassword", "confirmNewPassword"),
  asyncHandler(async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      res
        .status(422)
        .render(
          "root",
          getEditPasswordViewData(req.body, validationErrors.mapped()),
        );
      return;
    }

    await updateUserPasswordAsync(req.user.id, req.body.newPassword);

    res.redirect("/success/edit/?type=Profile&name=password");
  }),
];

const getEditBioViewData = (fieldValues, errors) => ({
  title: "Update Bio",
  mainView: "editUserBio",
  fieldValues,
  errors,
});

exports.editBioGET = (req, res) => {
  res.render("root", getEditBioViewData());
};

exports.editBioPOST = [
  bioValidations("bio"),
  asyncHandler(async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      return res
        .status(422)
        .render(
          "root",
          getEditBioViewData(req.body, validationErrors.mapped()),
        );
    }

    await updateUserBioAsync(req.user.id, req.body.bio);
    res.redirect("/success/edit/?type=Profile&name=bio");
  }),
];
