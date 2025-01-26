const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { body, check, validationResult } = require("express-validator");
const { addUserAsync } = require("../db/queries/users");

const nameValidationChain = (filedName) =>
  body(filedName)
    .trim()
    .notEmpty()
    .withMessage(`${filedName} cannot be empty.`)
    .isAlpha()
    .withMessage(`${filedName} must be only letters (Aa-Zz)`)
    .isLength({ max: 35 })
    .withMessage(`${filedName} must be between 1 to 35 characters`);

const formValidationChains = [
  nameValidationChain("firstName"),
  nameValidationChain("lastName"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Emaill address cannot be empty.")
    .isEmail()
    .withMessage("Invalid email address."),

  body("password")
    .notEmpty()
    .withMessage("Password cannot be empty.")
    .isLength({ min: 8, max: 32 })
    .withMessage("Password must be between 8 to 32 characters."),

  check("confirmPassword", "Passwords do not match.").custom(
    (value, { req }) => value === req.body.password,
  ),
];

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
  formValidationChains,

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
