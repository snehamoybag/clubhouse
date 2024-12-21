require("dotenv").config; // gain access to .env file varialbles
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const passport = require("./config/passport");

const indexRouter = require("./routes/indexRouter");
const signupRouter = require("./routes/signupRouter");
const loginRouter = require("./routes/loginRouter");
const logoutRouter = require("./routes/logoutRouter");
const successRouter = require("./routes/successRouter");

const errorHandler = require("./middlewares/errorHandler");
const notFound404Handler = require("./middlewares/notFound404Handler");

const app = express();

// set view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.session());

// body parser for html forms
app.use(express.urlencoded({ extended: true })); // parses html data

// routes
app.use("/", indexRouter);
app.use("/sign-up", signupRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/success", successRouter);

// error handler
app.use(errorHandler);

// error 404 route. Make sure it is at the end of all middleware functions
app.use(notFound404Handler);

// run server
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () =>
  console.log(`Server is running on http://${HOST}:${PORT}`),
);
