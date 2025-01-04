const { Router } = require("express");
const postController = require("../controllers/postController");

const router = new Router();

router.post("/post", postController.deletePOST);

module.exports = router;
