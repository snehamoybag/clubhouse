const asyncHandler = require("express-async-handler");
const postController = require("./postController");
const { getPostsAsync } = require("../db/queries/posts");

exports.GET = asyncHandler(async (req, res) => {
  const posts = await getPostsAsync(null, 30);
  console.log(posts);

  res.render("root", {
    title: "Clubhouse",
    mainView: "index",
    posts,
  });
});

exports.postMessagePOST = postController.add;
