module.exports = (err, req, res, next) => {
  console.error(err.message);
  const refererUrl = req.get("referer");

  res.status(err.statusCode || 500).render("error", {
    name: err.name || "error",
    statusCode: err.statusCode || 500,
    message: err.message || "internal server error",
    redirectUrl: refererUrl || "/",
    redirectUrlText: refererUrl ? "Go Back" : "Return to Homepage",
  });
};
