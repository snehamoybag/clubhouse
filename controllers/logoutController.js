exports.POST = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    res.redirect("/success/logout");
  });
};
