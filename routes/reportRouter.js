const { Router } = require("express");
const reportController = require("../controllers/reportController");
const handleNotAuthenticated = require("../middlewares/handleNotAuthenticated");

const router = new Router();

router.all("/*", handleNotAuthenticated);

router.get("/post", reportController.postGET);
router.post("/post", reportController.postPOST);

router.get("/review/post", reportController.reviewPostGET);
router.post("/review/post", reportController.reviewPostPOST);
module.exports = router;
