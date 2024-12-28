const { Router } = require("express");
const profileController = require("../controllers/profileController");
const router = new Router();

router.get("/", profileController.GET);

module.exports = router;
