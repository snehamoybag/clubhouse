const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
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

    bcrypt.hash(req.body.password, 10, async (error, hashedPassword) => {
      if (error) {
        throw error;
      }

      await addUserAsync(
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        hashedPassword,
      );
    });

    res.redirect("/success/signup");
  }),
];
