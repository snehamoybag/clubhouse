const { Router } = require("express");
const indexController = require("../controllers/indexController");

const router = Router();

router.get("/", indexController.GET);
router.post("/", indexController.postPOST);

module.exports = router;
