const { Router } = require("express");
const loginController = require("../controllers/loginController");
const handleAlreadyAuthenticated = require("../middlewares/handleAlreadyAuthenticated");

const router = new Router();

router.all("/*", handleAlreadyAuthenticated);

router.get("/", loginController.GET);
router.post("/", loginController.POST);

module.exports = router;
