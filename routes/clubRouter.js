const { Router } = require("express");
const clubController = require("../controllers/clubController");
const postController = require("../controllers/postController");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = new Router();

router.all("/*", isAuthenticated);

// make sure the 'new' routes are above '/:id' routes
// else  'new' will be considered an id of club
router.get("/new", clubController.newClubGET);
router.post("/new", clubController.newClubPOST);

router.get("/:id", clubController.GET);

router.post("/:id/post-message", postController.addPOST);

router.post("/:id/join-club", clubController.joinClubPOST);
router.post("/:id/leave-club", clubController.leaveClubPOST);

router.get("/:id/control-panel", clubController.controlPanelGET);

module.exports = router;
