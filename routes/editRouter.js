const postController = require("../controllers/postController");
const { Router } = require("express");

const router = new Router();

router.post("/post/:postId", postController.editPOST);

module.exports = router;
