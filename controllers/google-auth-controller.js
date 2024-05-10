const passport = require("passport");
const jwt = require("jsonwebtoken");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const HttpError = require("../errors/http-error");

class GoogleAuthController {
  constructor() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const existingUser = await User.findOne({
              where: { email: profile.emails[0].value },
            });

            if (existingUser) {
              const token = jwt.sign(
                {
                  userId: existingUser.id,
                  email: existingUser.email,
                  role: existingUser.role,
                },
                process.env.SECRET_KEY,
                { expiresIn: "1h" }
              );

              return done(null, { token });
            }

            const newUser = await User.create({
              name: profile.given_name,
              surname: profile.family_name,
              email: profile.emails[0].value,
              password: "",
              role: "BUYER",
            });

            const token = jwt.sign(
              {
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role,
              },
              process.env.SECRET_KEY,
              { expiresIn: "1h" }
            );

            return done(null, { token });
          } catch (err) {
            console.log(err.message);
            return done(err);
          }
        }
      )
    );
  }

  async auth(req, res, next) {
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );
  }

  async callback(req, res, next) {
    passport.authenticate("google", async (err, token, info) => {
      if (err) {
        const error = HttpError.internalServerError(
          "Google authentication failed, please try again later.",
          err
        );
        return next(error);
      }

      if (!token) {
        const error = HttpError.forbidden(
          "Google authentication failed, please try again later."
        );
        return next(error);
      }

      return res.status(200).json({ token });
    })(req, res, next);
  }
}

module.exports = new GoogleAuthController();
