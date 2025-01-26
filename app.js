require("dotenv").config();
const path = require("node:path");
const express = require("express");
const asyncHandler = require("express-async-handler");
const expressSession = require("./configs/expressSession");
const passport = require("./configs/passport");

const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const notFound404Handler = require("./middlewares/notFound404Handler");
const formatDateDistanceToNow = require("./lib/formatDateDistanceToNow");
const {
  getUnreadUserNotificationsCountAsync,
} = require("./db/queries/notifications");

const app = express();

// set view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// set root folder to serve static files
app.use(express.static("public"));

// session middlewares
app.use(expressSession);
app.use(passport.session());

// body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// set global locals variables
app.use(
  asyncHandler(async (req, res, next) => {
    res.locals.user = req.user;
    res.locals.formatDateDistanceToNow = formatDateDistanceToNow;
    res.locals.prevUrl = req.originalUrl === "/" ? "" : req.get("Referrer"); // only set back url if current url is not the home page

    if (req.user) {
      res.locals.unreadUserNotificationsCount =
        await getUnreadUserNotificationsCountAsync(req.user.id);
    }

    next();
  }),
);

// routes
app.use(routes);

// error handler
// comment out this middleware if you do not know from where the error is coming
app.use(errorHandler);

// error 404 route. Make sure it is at the end of all middleware functions
app.use(notFound404Handler);

// run server
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () =>
  console.log(`Server is running on http://${HOST}:${PORT}`),
);
