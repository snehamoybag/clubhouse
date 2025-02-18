const postController = require("../controllers/postController");
const clubController = require("../controllers/clubController");
const profileController = require("../controllers/profileController");
const { Router } = require("express");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");
const handleNotProfileOwner = require("../middlewares/handleNotProfileOwner");

const router = new Router();

router.all("/*", handleNotAuthenticated);

router.post("/post/:id", postController.editPOST);

router.post("/club/:id/name", clubController.editClubNamePOST);
router.post("/club/:id/about", clubController.editClubAboutPOST);
router.post("/club/:id/privacy", clubController.editClubPrivacyPOST);

router.all("/profile/:id/*", handleNotProfileOwner);

router.get("/profile/:id/name", profileController.editNameGET);
router.post("/profile/:id/name", profileController.editNamePOST);

router.get("/profile/:id/email", profileController.editEmailGET);
router.post("/profile/:id/email", profileController.editEmailPOST);

router.get("/profile/:id/password", profileController.editPasswordGET);
router.post("/profile/:id/password", profileController.editPasswordPOST);

module.exports = router;
