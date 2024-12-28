const { Router } = require("express");
const clubController = require("../controllers/clubController");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = new Router();

router.all("/*", isAuthenticated);

// make sure the 'new' routes are above '/:id' routes
// else  'new' will be considered an id of club
router.get("/new", clubController.newClubGET);
router.post("/new", clubController.newClubPOST);

router.get("/:id", clubController.GET);

module.exports = router;
