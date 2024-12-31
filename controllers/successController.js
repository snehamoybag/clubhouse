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

exports.leaveClubGET = (req, res) => {
  const prevUrl = req.get("referer");
  const redirectUrl = prevUrl || "/";
  const redirectUrlText = prevUrl ? "Return to Clubpage" : "Return to Homepage";

  res.render(
    "root",
    getViewData(
      "Leaving club successful!",
      "You're no longer a member of the club.",
      redirectUrl,
      redirectUrlText,
    ),
  );
};
