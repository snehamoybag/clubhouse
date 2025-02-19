const postController = require("../controllers/postController");
const clubController = require("../controllers/clubController");
const profileController = require("../controllers/profileController");
const { Router } = require("express");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");
const handleNotProfileOwner = require("../middlewares/handleNotProfileOwner");
const handleInvalidClub = require("../middlewares/handleInvalidClub");

const router = new Router();

router.all("/*", handleNotAuthenticated);

router.post("/post/:id", postController.editPOST);

router.all("/cub/*", handleInvalidClub);
router.get("/club/:id", clubController.editClubGET);
router.post("/club/:id", clubController.editClubPOST);

router.all("/profile/:id/*", handleNotProfileOwner);

router.get("/profile/:id/name", profileController.editNameGET);
router.post("/profile/:id/name", profileController.editNamePOST);

router.get("/profile/:id/bio", profileController.editBioGET);
router.post("/profile/:id/bio", profileController.editBioPOST);

router.get("/profile/:id/email", profileController.editEmailGET);
router.post("/profile/:id/email", profileController.editEmailPOST);

router.get("/profile/:id/password", profileController.editPasswordGET);
router.post("/profile/:id/password", profileController.editPasswordPOST);

module.exports = router;
