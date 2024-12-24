const asyncHandler = require("express-async-handler");
const isAuthenticated = require("../middlewares/isAuthenticated");
const addPost = require("../middlewares/addPost");
const { getPostsAsync } = require("../db/queries/posts");

exports.GET = asyncHandler(async (req, res) => {
  const posts = await getPostsAsync(30);
  console.log(posts);

  res.render("root", {
    title: "Clubhouse",
    mainView: "index",
    posts: posts,
  });
});

exports.postPOST = [
  isAuthenticated,
  addPost,
  (req, res) => {
    res.redirect("/");
  },
];
