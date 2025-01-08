const { Router } = require("express");
const postController = require("../controllers/postController");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");

const router = new Router();

router.all("*/", handleNotAuthenticated);

router.post("/post", postController.deletePOST);

module.exports = router;
