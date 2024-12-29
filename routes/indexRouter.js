const { Router } = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const indexController = require("../controllers/indexController");

const router = Router();

router.get("/", indexController.GET);

router.post("/post-message", isAuthenticated, indexController.postMessagePOST);

module.exports = router;
