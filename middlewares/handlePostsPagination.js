// make sure to call this middleware before rendering the posts
module.exports = (req, res, next) => {
  const direction = req.query.postsLoadDirection;
  const currentPage = Number(req.query.postsCurrentPage) || 1;

  if (direction !== "next" && direction !== "prev") {
    // do nothing the query is invalid
    return next();
  }

  let nextPage = currentPage;

  if (direction === "next") {
    nextPage = currentPage + 1;
  }

  if (direction === "prev" && currentPage > 1) {
    nextPage = currentPage - 1;
  }

  res.locals.postsCurrentPage = nextPage;

  next();
};
