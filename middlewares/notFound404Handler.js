module.exports = (req, res, next) => {
  res.status(404).render("error", {
    name: "NotFound",
    statusCode: 404,
    message:
      "The resource you're looking for doesn't exist or may have been deleted permanently.",
  });
};
