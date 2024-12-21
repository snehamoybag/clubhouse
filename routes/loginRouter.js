const { Router } = require("express");
const loginController = require("../controllers/loginController");

const router = new Router();

router.get("/", loginController.GET);
router.post("/", loginController.POST);

module.exports = router;
