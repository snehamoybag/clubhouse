const signupController = require("../controllers/signupController");
const { Router } = require("express");

const router = new Router();

router.get("/", signupController.GET);
router.post("/", signupController.POST);

module.exports = router;
