const asyncHandler = require("express-async-handler");
const { getPostsAsync } = require("../db/queries/posts");
const handlePostsPagination = require("../middlewares/handlePostsPagination");

exports.GET = [
  handlePostsPagination,
  asyncHandler(async (req, res) => {
    const posts = await getPostsAsync(null, 30, res.locals.postsCurrentPage);

    res.render("root", {
      title: "Clubhouse",
      mainView: "index",
      posts,
      styles: "index",
    });
  }),
];
