const postController = require("../controllers/postController");
const clubController = require("../controllers/clubController");
const { Router } = require("express");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");

const router = new Router();

router.all("/*", handleNotAuthenticated);

router.post("/post/:id", postController.editPOST);

router.post("/club/:id/name", clubController.editClubNamePOST);
router.post("/club/:id/about", clubController.editClubAboutPOST);
router.post("/club/:id/privacy", clubController.editClubPrivacyPOST);

module.exports = router;
