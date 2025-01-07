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

exports.joinClubGET = (req, res) => {
  res.render(
    "root",
    getViewData(
      "Club joined successfuly!",
      `Congratulations! You're now an honourable member of '${req.query.clubName}'. 🥳`,
      `/club/${req.query.clubId}`,
      "Go to Clubpage",
    ),
  );
};

exports.leaveClubGET = (req, res) => {
  res.render(
    "root",
    getViewData(
      "Leaving club successful!",
      "You're no longer a member of the club.",
      `/club/${req.query.clubId}`,
      "Return to Clubpage",
    ),
  );
};

exports.editGET = (req, res) => {
  const successType = req.query.type;
  const successName = req.query.name;

  const message = `${successType} ${successName} edited successfully.`;

  res.render(
    "root",
    getViewData("Edit Successful!", message, req.get("Referrer"), "Go back"),
  );
};
