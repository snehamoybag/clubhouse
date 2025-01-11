const { Router } = require("express");
const profileController = require("../controllers/profileController");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");
const handleNotProfileOwner = require("../middlewares/handleNotProfileOwner");
const router = new Router();

router.all("/*", handleNotAuthenticated);

router.get("/:id", profileController.GET);

router.get(
  "/:id/notifications",
  handleNotProfileOwner,
  profileController.noitficationsGET,
);

router.post(
  "/:id/notification/mark-read",
  profileController.markNotificationAsReadSilentlyPOST,
);

module.exports = router;
