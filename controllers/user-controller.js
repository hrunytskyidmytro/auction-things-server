const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const HttpError = require("../errors/http-error");
const PinCodeService = require("../controllers/pincode-controller");

class UserController {
  async signup(req, res, next) {
    const {
      name,
      surname,
      patronymic,
      email,
      password,
      confirmPassword,
      role,
      phoneNumber,
      countryCode,
    } = req.body;

    if (password !== confirmPassword) {
      const error = HttpError.badRequest("Passwords do not match.");
      return next(error);
    }

    let existingUser;
    try {
      existingUser = await User.findOne({ where: { email } });
    } catch (err) {
      console.log(err.message);
      const error = HttpError.internalServerError(
        "Signing up failed, please try again later.",
        err
      );
      return next(error);
    }

    if (existingUser) {
      const error = HttpError.forbidden(
        "User exists already, please login instead."
      );
      return next(error);
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      const error = HttpError.internalServerError(
        "Could not create user, please try again.",
        err
      );
      return next(error);
    }

    const createdUser = await User.create({
      name,
      surname,
      patronymic,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      countryCode,
    });

    try {
      const pinCode = await PinCodeService.generatePinCode();
      await PinCodeService.savePinCode(createdUser.id, pinCode);
      await PinCodeService.sendPinCode(
        createdUser.id,
        createdUser.email,
        pinCode
      );
    } catch (err) {
      console.log(err.message);
      const error = HttpError.internalServerError(
        "Could not send pin code, please try again later.",
        err
      );
      return next(error);
    }

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
      const error = HttpError.internalServerError(
        "Signing up failed, please try again later.",
        err
      );
      return next(error);
    }

    return res.status(201).json({ token });
  }

  async login(req, res, next) {
    const { email, password, pinCode } = req.body;

    if (!pinCode) {
      const error = HttpError.badRequest("Pin code is missing.");
      return next(error);
    }

    let existingUser;
    try {
      existingUser = await User.findOne({ where: { email } });
    } catch (err) {
      const error = HttpError.internalServerError(
        "Logging up failed, please try again later.",
        err
      );
      return next(error);
    }

    if (!existingUser) {
      const error = HttpError.forbidden(
        "Invalid credentials, could not log you in."
      );
      return next(error);
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      const error = HttpError.internalServerError(
        "Could not log you in, please check your credentials and try again.",
        err
      );
      return next(error);
    }

    if (!isValidPassword) {
      const error = HttpError.forbidden(
        "Invalid credentials, could not log you in."
      );
      return next(error);
    }

    let isValidPinCode = false;
    try {
      isValidPinCode = await PinCodeService.checkPinCode(
        existingUser.id,
        pinCode
      );
    } catch (err) {
      const error = HttpError.internalServerError(
        "Could not check pin code, please try again later.",
        err
      );
      return next(error);
    }

    if (!isValidPinCode) {
      const error = HttpError.forbidden(
        "Invalid pin code, could not log you in."
      );
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
      const error = HttpError.internalServerError(
        "Logging in failed, please try again later.",
        err
      );
      return next(error);
    }

    return res.status(200).json({ token });
  }
}

module.exports = new UserController();
