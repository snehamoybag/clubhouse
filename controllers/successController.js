const getViewData = (title, message, redirectLink, redirectText) => ({
  title,
  message,
  redirectLink,
  redirectText,
  mainView: "success",
});

exports.signupGET = (req, res) => {
  res.render(
    "root",
    getViewData(
      "Sign up successful!",
      "You can now login using your email and passoword.",
      "/login",
      "Login to Clubhouse ->",
    ),
  );
};

exports.logoutGET = (req, res) => {
  res.render(
    "root",
    getViewData(
      "Logout successful!",
      "You're no longer logged in to Clubhouse.",
      "/",
      "Return to Homepage",
    ),
  );
};
