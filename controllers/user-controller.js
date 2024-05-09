const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const HttpError = require("../errors/http-error");
const PinCodeService = require("./pin-code-controller");

class UserController {
  async signUp(req, res, next) {
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
      const pinCodeData = await PinCodeService.generatePinCode();
      await PinCodeService.savePinCode(createdUser.id, pinCodeData);
      await PinCodeService.sendPinCode(
        createdUser.id,
        createdUser.email,
        pinCodeData.pinCode
      );
    } catch (err) {
      console.log(err.message);
      const error = HttpError.internalServerError(
        "Could not send pin code, please try again later.",
        err
      );
      return next(error);
    }

    return res.status(201).json({ message: "User created successfully." });
  }

  async logIn(req, res, next) {
    const { email, password } = req.body;

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

    try {
      const pinCodeData = await PinCodeService.generatePinCode();
      await PinCodeService.savePinCode(existingUser.id, pinCodeData);
      await PinCodeService.sendPinCode(
        existingUser.id,
        existingUser.email,
        pinCodeData.pinCode
      );
    } catch (err) {
      console.log(err.message);
      const error = HttpError.internalServerError(
        "Could not send pin code, please try again later.",
        err
      );
      return next(error);
    }

    return res.status(200).json({ message: "Pin code sent successfully." });
  }

  async checkPinCode(req, res, next) {
    const { email, pinCode } = req.body;

    let existingUser;
    try {
      existingUser = await User.findOne({ where: { email } });
    } catch (err) {
      const error = HttpError.internalServerError(
        "Checking pin code failed, please try again later.",
        err
      );
      return next(error);
    }

    if (!existingUser) {
      const error = HttpError.forbidden(
        "User not found, please check your email and try again."
      );
      return next(error);
    }

    const isValidPinCode = await PinCodeService.checkPinCode(
      existingUser.id,
      pinCode
    );
    if (!isValidPinCode) {
      const error = HttpError.forbidden(
        "Invalid pin code, please check your pin code and try again."
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
        "Checking pin code failed, please try again later.",
        err
      );
      return next(error);
    }

    res.status(200).json({ token });
  }

  async resendPinCode(req, res, next) {
    const { userId, email } = req.body;

    try {
      await PinCodeService.sendPinCode(userId, email);
      return res.status(200).json({ message: "Pin code resent successfully." });
    } catch (err) {
      console.log(err.message);
      const error = HttpError.internalServerError(
        "Resending pin code failed, please try again later.",
        err
      );
      return next(error);
    }
  }
}

module.exports = new UserController();
