const asyncHandler = require("express-async-handler");
const CustomAccessDeniedError = require("../lib/errors/CustomAccessDeniedError");

exports.GET = asyncHandler(async (req, res) => {
  console.log(req.user);
  if (!req.isAuthenticated()) {
    throw new CustomAccessDeniedError(
      "You do not have permission to view this page.",
    );
  }

  res.render("root", { title: "Clubhouse", mainView: "index", user: req.user });
});
