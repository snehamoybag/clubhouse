const { Router } = require("express");
const reportController = require("../controllers/reportController");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");

const router = new Router();

router.all("/*", handleNotAuthenticated);

router.get("/post", reportController.postGET);
router.post("/post", reportController.postPOST);

module.exports = router;
