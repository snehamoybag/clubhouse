const { Router } = require("express");
const logoutController = require("../controllers/logoutController");

const router = new Router();

router.post("/", logoutController.POST);

module.exports = router;
