const { Router } = require("express");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");
const postController = require("../controllers/postController");

const router = new Router();

router.all("/*", handleNotAuthenticated);

router.post("/post/:postId", postController.likePOST);

module.exports = router;
