const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const { addUserAsync } = require("../db/queries/users");
const {
  nameValidations,
  emailValidations,
  passwordValidations,
  confirmPasswordValidations,
} = require("../validations/uservalidations");

const getViewData = (fieldValues, errors) => ({
  title: "Sign up",
  mainView: "signup",
  fieldValues,
  errors,
  styles: "signup",
});

exports.GET = asyncHandler(async (req, res) => {
  res.render("root", getViewData());
});

exports.POST = [
  nameValidations("firstName"),
  nameValidations("lastName"),
  emailValidations("email"),
  passwordValidations("password"),
  confirmPasswordValidations("password", "confirmPassword"),
  asyncHandler(async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      res
        .status(422)
        .render("root", getViewData(req.body, validationErrors.mapped()));
      return;
    }

    await addUserAsync(
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.password,
    );

    res.redirect("/success/signup");
  }),
];
