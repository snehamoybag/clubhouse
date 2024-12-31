const { Router } = require("express");
const clubsListController = require("../controllers/clubsListController");

const router = new Router();

router.get("/", clubsListController.GET);

module.exports = router;
