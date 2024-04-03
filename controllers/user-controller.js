const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserController {
  async signup(req, res, next) {
    const { name, surname, patronymic, email, password, role } = req.body;

    let existingUser;
    try {
      existingUser = await User.findOne({ where: { email } });
    } catch (err) {
      console.log(err);
      const error = new Error("Signing up failed, please try again later.");
      return next(error);
    }

    if (existingUser) {
      const error = new Error("User exists already, please login instead.");
      return next(error);
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      const error = new Error("Could not create user, please try again.");
      return next(error);
    }

    const createdUser = await User.create({
      name,
      surname,
      patronymic,
      email,
      password: hashedPassword,
      role,
    });

    let token;
    try {
      token = jwt.sign(
        {
          userId: createdUser.id,
          email: createdUser.email,
          role: createdUser.role,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
    } catch (err) {
      const error = new Error("Signing up failed, please try again later.");
      return next(error);
    }

    return res.json({ token });
  }

  async login(req, res, next) {
    const { email, password } = req.body;

    let existingUser;
    try {
      existingUser = await User.findOne({ where: { email } });
    } catch (err) {
      const error = new Error("Logging up failed, please try again later.");
      return next(error);
    }

    if (!existingUser) {
      const error = new Error("Invalid credentials, could not log you in.");
      return next(error);
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      const error = new Error(
        "Could not log you in, please check your credentials and try again."
      );
      return next(error);
    }

    if (!isValidPassword) {
      const error = new Error("Invalid credentials, could not log you in.");
      return next(error);
    }

    let token;
    try {
      token = jwt.sign(
        {
          userId: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
    } catch (err) {
      const error = new Error("Logging in failed, please try again later.");
      return next(error);
    }

    return res.json({ token });
  }
}

module.exports = new UserController();
