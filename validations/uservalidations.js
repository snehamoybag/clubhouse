const { body, check } = require("express-validator");
const { doesEmailExistAsync } = require("../db/queries/users");
const getIsPasswordMatchingAsync = require("../lib/getIsPasswordMatchingAsync");

exports.nameValidations = (filedName) => {
  return body(filedName)
    .trim()
    .notEmpty()
    .withMessage(`${filedName} cannot be empty.`)
    .isAlpha()
    .withMessage(`${filedName} must be only letters (Aa-Zz)`)
    .isLength({ max: 35 })
    .withMessage(`${filedName} must be between 1 to 35 characters`);
};

exports.emailValidations = (fieldName) => {
  return body(fieldName)
    .trim()
    .notEmpty()
    .withMessage("Emaill address cannot be empty.")
    .isEmail()
    .withMessage("Invalid email address.")
    .custom(async (fieldValue) => {
      if (await doesEmailExistAsync(fieldValue)) {
        throw new Error("Email already exists.");
      }

      return true;
    });
};

exports.confirmEmailValidations = (emailFieldName, confirmEmailFieldName) => {
  return check(confirmEmailFieldName, "Emails do not match.").custom(
    (confirmEmailValue, { req }) => {
      return confirmEmailValue === req.body[emailFieldName];
    },
  );
};

exports.currentEmailValidations = (fieldName) => {
  return check(fieldName, "Current email do not match.").custom(
    (filedValue, { req }) => {
      return filedValue.trim() === req.user.email;
    },
  );
};

exports.passwordValidations = (fieldName) => {
  return body(fieldName)
    .notEmpty()
    .withMessage("Password cannot be empty.")
    .isLength({ min: 8, max: 32 })
    .withMessage("Password must be between 8 to 32 characters.");
};

exports.confirmPasswordValidations = (
  passwordFieldName,
  confirmPasswordFieldName,
) => {
  return check(confirmPasswordFieldName, "Passwords do not match").custom(
    (confirmPasswordValue, { req }) => {
      return confirmPasswordValue === req.body[passwordFieldName];
    },
  );
};

exports.currentPasswordValidations = (fieldName) => {
  return check(fieldName).custom(async (fieldValue, { req }) => {
    if (!(await getIsPasswordMatchingAsync(fieldValue, req.user.password))) {
      // async call back must throw error message
      throw new Error("Current password do not match.");
    }

    return true;
  });
};

exports.bioValidations = (fieldName) => {
  return body(fieldName)
    .isLength({ max: 255 })
    .withMessage("Bio must not be more than 255 characters.");
};
