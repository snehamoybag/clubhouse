const { Router } = require("express");
const clubController = require("../controllers/clubController");
const postController = require("../controllers/postController");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");
const handleUserBannedFromClub = require("../middlewares/handleUserBannedFromClub");
const handleInvalidClub = require("../middlewares/handleInvalidClub");

const router = new Router();

router.all("/*", handleNotAuthenticated);

// make sure any of these routes are above '/:id' routes
// else  'new' etc. will be considered an id of club
router.get("/new", clubController.newClubGET);
router.post("/new", clubController.newClubPOST);

router.get("/invite", clubController.inviteToClubGET);
router.post("/invite", clubController.inviteToClubPOST);

router.all("/:id", handleInvalidClub, handleUserBannedFromClub);

router.get("/:id", clubController.GET);

router.post("/:id/post-message", postController.addPOST);

router.post("/:id/join-club", clubController.joinClubPOST);
router.post("/:id/leave-club", clubController.leaveClubPOST);

router.post(
  "/:id/accept-join-request",
  clubController.acceptClubJoinRequestPOST,
);
router.post(
  "/:id/decline-join-request",
  clubController.declineClubJoinRequestPOST,
);

router.post("/:id/club-invite", clubController.handleClubInvitePOST);

router.get("/:id/control-panel", clubController.controlPanelGET);
router.get("/:id/control-panel/join-requests", clubController.joinRequestsGET);

router.get(
  "/:id/control-panel/reported-posts",
  clubController.reportedClubPostsGET,
);

router.get("/:id/control-panel/ban-list", clubController.banListGET);
router.post("/:id/control-panel/ban-list/add", clubController.banUserPOST);
router.post(
  "/:id/control-panel/ban-list/remove",
  clubController.removeUserBanPOST,
);

module.exports = router;
