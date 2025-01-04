require("dotenv").config();
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("../configs/pool");

const pgStore = new pgSession({
  pool: pool,
  createTableIfMissing: true,
});

module.exports = session({
  store: pgStore,
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});
