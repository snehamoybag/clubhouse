const { Router } = require("express");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");
const postController = require("../controllers/postController");

const router = new Router();

router.all("/*", handleNotAuthenticated);
router.get("/:id", postController.GET);

module.exports = router;
