const passport = require("passport");

const getViewData = (errors) => ({
  title: "Login to Clubhouse",
  mainView: "login",
  errors: errors,
});

exports.GET = (req, res) => {
  res.render("root", getViewData());
};

exports.POST = [
  (req, res, next) => {
    passport.authenticate("local", (error, user, info) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        const fieldErrors = {
          email: info.messageEmail,
          password: info.messagePassword,
        };

        res.status(401).render("root", getViewData(fieldErrors));
        return;
      }

      // create req.user after successful login
      req.login(user, next);
    })(req, res, next);
  },

  // after successful login redirect user
  (req, res) => {
    res.redirect("/");
  },
];
