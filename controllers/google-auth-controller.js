const passport = require("passport");
const jwt = require("jsonwebtoken");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models");

class GoogleAuthController {
  constructor() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "http://localhost:5001/api/auth/google/callback",
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
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              email: profile.emails[0].value,
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
      if (err || !token) {
        return res.redirect(
          `http://localhost:3000/login?error=${encodeURIComponent(
            "Не вдалося пройти автентифікацію в Google, повторіть спробу пізніше."
          )}`
        );
      }

      return res.redirect(
        `http://localhost:3000/auth/google/callback?token=${token.token}`
      );
    })(req, res, next);
  }
}

module.exports = new GoogleAuthController();
