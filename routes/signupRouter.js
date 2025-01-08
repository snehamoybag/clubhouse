const signupController = require("../controllers/signupController");
const handleAlreadyAuthenticated = require("../middlewares/handleAlreadyAuthenticated");
const { Router } = require("express");

const router = new Router();

router.all("/*", handleAlreadyAuthenticated);

router.get("/", signupController.GET);
router.post("/", signupController.POST);

module.exports = router;
