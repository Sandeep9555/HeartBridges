const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();
const User = require("../models/userModel");
const { validateSignUpData } = require("../utils/validation");

// Helper function to send JWT cookie
const sendToken = (res, user) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    expires: new Date(Date.now() + 8 * 3600000),
  });
};

// ------------------- Google Strategy -------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            emailId: profile.emails?.[0]?.value || "",
            password: null,
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ------------------- Passport Session -------------------
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ------------------- GitHub Routes -------------------

// ------------------- Google Routes -------------------
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.BASE_URL}/login`,
  }),
  (req, res) => {
    sendToken(res, req.user);
    res.redirect(`${process.env.BASE_URL}`);
  }
);

// ------------------- Local Signup -------------------
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    sendToken(res, savedUser);

    res.json({ message: "User added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// ------------------- Local Login -------------------
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(400).send("Invalid credentials");
    }

    sendToken(res, user);
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// ------------------- Logout -------------------
authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("Logout successful!");
});

module.exports = authRouter;
