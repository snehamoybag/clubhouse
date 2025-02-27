const asyncHandler = require("express-async-handler");
const { getGlobalPostsAsync } = require("../db/queries/posts");

exports.GET = asyncHandler(async (req, res) => {
  const pageSize = 30;
  const currentPage = Number(req.query.page) || 1;
  const posts = await getGlobalPostsAsync(req.user.id, pageSize, currentPage);

  res.render("root", {
    title: "Clubhouse",
    mainView: "index",
    posts,
    pagination: {
      page: currentPage,
      pageSize,
    },
    styles: "index",
  });
});
