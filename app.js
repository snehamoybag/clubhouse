require("dotenv").config; // gain access to .env file varialbles
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const indexRouter = require("./routes/indexRouter");
const signupRouter = require("./routes/signupRouter");

const app = express();

// set view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// session middleware
app.use(
  session({ secret: "abrakadbara", resave: false, saveUninitialized: false }),
);
app.use(passport.session());

// body parser for html forms
app.use(express.urlencoded({ extended: true })); // parses html data

// routes
app.use("/", indexRouter);
app.use("/sign-up", signupRouter);

// error handler
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(err.statusCode || 500).render("error", {
    name: err.name || "error",
    statusCode: err.statusCode || 500,
    message: err.message || "internal server error",
  });
});

// error 404 route. Make sure it is at the end of all middleware functions
app.use((req, res, next) => {
  res.status(404).render("error", {
    name: "NotFound",
    statusCode: 404,
    message: "Page not found.",
  });
});

// run server
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () =>
  console.log(`Server is running on http://${HOST}:${PORT}`),
);
