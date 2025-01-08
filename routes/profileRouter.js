const { Router } = require("express");
const profileController = require("../controllers/profileController");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");
const router = new Router();

router.all("/*", handleNotAuthenticated);
router.get("/:id", profileController.GET);

module.exports = router;
