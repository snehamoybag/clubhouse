const { Router } = require("express");
const indexRouter = require("./indexRouter");
const signupRouter = require("./signupRouter");
const loginRouter = require("./loginRouter");
const logoutRouter = require("./logoutRouter");
const successRouter = require("./successRouter");
const profileRouter = require("./profileRouter");
const clubRouter = require("./clubRouter");
const clubsListRouter = require("./clubsListRouter");
const deleteRouter = require("./deleteRouter");

const router = new Router();

router.use("/", indexRouter);
router.use("/sign-up", signupRouter);
router.use("/login", loginRouter);
router.use("/logout", logoutRouter);
router.use("/success", successRouter);
router.use("/profile", profileRouter);
router.use("/club", clubRouter);
router.use("/list-of-clubs", clubsListRouter);
router.use("/delete", deleteRouter);

module.exports = router;
