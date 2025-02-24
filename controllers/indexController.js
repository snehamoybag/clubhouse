const asyncHandler = require("express-async-handler");
const { getGlobalPostsAsync } = require("../db/queries/posts");
const handlePostsPagination = require("../middlewares/handlePostsPagination");

exports.GET = [
  handlePostsPagination,
  asyncHandler(async (req, res) => {
    const posts = await getGlobalPostsAsync(30);

    res.render("root", {
      title: "Clubhouse",
      mainView: "index",
      posts,
      styles: "index",
    });
  }),
];
