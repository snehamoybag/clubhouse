const { Router } = require("express");
const clubsListController = require("../controllers/clubsListController");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");

const router = new Router();

router.all("/*", handleNotAuthenticated);

router.get("/", clubsListController.GET);

module.exports = router;
