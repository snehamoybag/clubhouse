const { Router } = require("express");
const indexController = require("../controllers/indexController");
const postController = require("../controllers/postController");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");

const router = Router();

router.get("/", indexController.GET);

router.post("/post-message", handleNotAuthenticated, postController.addPOST);

module.exports = router;
