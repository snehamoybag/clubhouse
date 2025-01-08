const { Router } = require("express");
const logoutController = require("../controllers/logoutController");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");

const router = new Router();

router.post("/", handleNotAuthenticated, logoutController.POST);

module.exports = router;
