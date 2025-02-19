const { body } = require("express-validator");
const { isClubNameAvailableAsync } = require("../db/queries/clubs");

exports.nameValidations = (fieldName) => {
  return body(fieldName)
    .trim()
    .notEmpty()
    .withMessage("Club name cannot be empty.")
    .isLength({ max: 128 })
    .withMessage("Club name must be between 1 and 128 characters.")
    .custom(async (fieldValue) => {
      if (!(await isClubNameAvailableAsync(fieldValue))) {
        throw new Error("Club name already taken, please enter a new one.");
      }

      return true;
    });
};

exports.aboutValidations = (fieldName) => {
  return body(fieldName)
    .trim()
    .notEmpty()
    .withMessage("About club cannot be empty.")
    .isLength({ max: 255 })
    .withMessage("About club must be between 1 and 255 characters.");
};

exports.privacyValidations = (fieldName) => {
  return body(fieldName).custom((fieldValue) => {
    const validPrivacyOptions = ["open", "closed", "invite-only"];

    if (!validPrivacyOptions.includes(fieldValue)) {
      throw new Error("Invalid privacy option.");
    }

    return true;
  });
};
