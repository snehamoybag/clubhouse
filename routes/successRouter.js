const { Router } = require("express");
const successController = require("../controllers/successController");

const router = new Router();

router.get("/signup", successController.signupGET);
router.get("/logout", successController.logoutGET);

module.exports = router;
