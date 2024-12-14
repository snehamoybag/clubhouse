const path = require("node:path");
const express = require("express");

const indexRouter = require("./routes/indexRouter");

const app = express();

// set view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// parse req.body
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/", indexRouter);

// run server
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () =>
  console.log(`Server is running on http://${HOST}:${PORT}`),
);
