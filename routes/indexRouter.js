const { Router } = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const indexController = require("../controllers/indexController");
const postController = require("../controllers/postController");

const router = Router();

router.get("/", indexController.GET);

router.post("/post-message", isAuthenticated, postController.addPOST);

module.exports = router;
