const asyncHandler = require("express-async-handler");
const { getGlobalPostsAsync } = require("../db/queries/posts");

exports.GET = asyncHandler(async (req, res) => {
  const pageSize = 30;
  const currentPage = Number(req.query.page) || 1;
  const userId = req.user ? req.user.id : 0; // 0 is the fallback if user is not logged in

  const posts = await getGlobalPostsAsync(userId, pageSize, currentPage);

  res.render("root", {
    title: "Clubhouse",
    mainView: "index",
    posts,
    pagination: {
      page: currentPage,
      pageSize,
      numOfItems: posts.length,
    },
    styles: "index",
  });
});
