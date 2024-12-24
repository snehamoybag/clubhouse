require("dotenv").config();
const path = require("node:path");
const express = require("express");
const expressSession = require("./config/expressSession");
const passport = require("./config/passport");

const routes = require("./routes");

const errorHandler = require("./middlewares/errorHandler");
const notFound404Handler = require("./middlewares/notFound404Handler");

const app = express();

// set view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// session middlewares
app.use(expressSession);
app.use(passport.session());

// body parser for html forms
app.use(express.urlencoded({ extended: true }));

// set global locals variables
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// routes
app.use(routes);

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
