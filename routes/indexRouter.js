const { Router } = require("express");
const indexController = require("../controllers/indexController");
const messageController = require("../controllers/messageController");

const router = Router();

router.get("/", indexController.GET);
router.post("/", messageController.POST);

module.exports = router;
