const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const {
  getUserByEmailAsync,
  getUserByIdAsync,
} = require("../db/queries/users");
const bcrypt = require("bcryptjs");

const customFields = {
  usernameField: "email",
  passwordField: "password",
};

const verifyCallback = async (email, password, done) => {
  try {
    const user = await getUserByEmailAsync(email);

    if (!user) {
      return done(null, false, { messageEmail: "Email is not registered" });
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      return done(null, false, { messagePassword: "Incorrect password." });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
};

passport.use(new LocalStrategy(customFields, verifyCallback));

// create a session after successful login
// 'user' is the object we get from successful login
passport.serializeUser((user, done) => {
  done(null, user.id); // storing user id in the session cookie
});

// create 'req.user' object by retriving the user id we passed in the session cookie
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserByIdAsync(Number(id));
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
