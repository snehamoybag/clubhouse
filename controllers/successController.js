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
      "Club joined successfully!",
      `Congratulations! You're now an honourable member of '${req.query.clubName}'. 🥳`,
      `/club/${req.query.clubId}`,
      "Go to club",
    ),
  );
};

exports.clubJoinRequestSendGET = (req, res) => {
  res.render(
    "root",
    getViewData(
      "Request send successfully!",
      `Request to join '${req.query.clubName}' is successful. Please wait for the admin's approval.`,
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
      "Return to club",
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

exports.reportGET = (req, res) => {
  const reportType = req.query.type;
  const message = `The ${reportType} has been reported successfully!`;

  res.render("root", getViewData("Report Successful!", message));
};

exports.userBannedGET = (req, res) => {
  const clubId = Number(req.query.clubId);

  let message =
    "User added to the club's banned list successfuly. The user will not be able to join or interact with the club ever again.";

  if (!clubId) {
    message = "Successfuly banned the user from the site.";
  }

  res.render(
    "root",
    getViewData(
      "User Banned!",
      message,
      `/club/${clubId}`,
      "Return to club page",
    ),
  );
};
