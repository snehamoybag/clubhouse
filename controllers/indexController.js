const asyncHandler = require("express-async-handler");
const { getPostsAsync } = require("../db/queries/posts");

exports.GET = asyncHandler(async (req, res) => {
  let posts = await getPostsAsync(null, 30);

  res.render("root", {
    title: "Clubhouse",
    mainView: "index",
    posts,
    styles: "index",
  });
});
