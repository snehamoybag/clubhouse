exports.GET = (req, res) => {
  const user = req.user;

  res.render("root", {
    title: `Profile | ${user.first_name} ${user.last_name}`,
    mainView: "profile",
    user: user,
  });
};
