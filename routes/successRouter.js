const { Router } = require("express");
const successController = require("../controllers/successController");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");

const router = new Router();

router.get("/signup", handleNotAuthenticated, successController.signupGET);
router.get("/logout", successController.logoutGET);

router.get("/join-club", handleNotAuthenticated, successController.joinClubGET);
router.get(
  "/join-club-request-send",
  handleNotAuthenticated,
  successController.clubJoinRequestSendGET,
);
router.get(
  "/leave-club",
  handleNotAuthenticated,
  successController.leaveClubGET,
);

router.get("/edit", handleNotAuthenticated, successController.editGET);

module.exports = router;
