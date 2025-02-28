const { Router } = require("express");

const indexRouter = require("./indexRouter");
const signupRouter = require("./signupRouter");
const loginRouter = require("./loginRouter");
const logoutRouter = require("./logoutRouter");
const successRouter = require("./successRouter");
const profileRouter = require("./profileRouter");
const clubRouter = require("./clubRouter");
const clubsListRouter = require("./clubsListRouter");
const editRouter = require("./editRouter");
const deleteRouter = require("./deleteRouter");
const reportRouter = require("./reportRouter");
const likeRouter = require("./likeRouter");
const postRouer = require("./postRouter");

const router = new Router();

router.use("/", indexRouter);
router.use("/sign-up", signupRouter);
router.use("/login", loginRouter);
router.use("/logout", logoutRouter);
router.use("/success", successRouter);
router.use("/profile", profileRouter);
router.use("/club", clubRouter);
router.use("/list-of-clubs", clubsListRouter);
router.use("/edit", editRouter);
router.use("/delete", deleteRouter);
router.use("/report", reportRouter);
router.use("/like", likeRouter);
router.use("/post", postRouer);

module.exports = router;
