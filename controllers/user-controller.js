const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models");
const HttpError = require("../errors/http-error");
const PinCodeService = require("./pin-code-controller");

class UserController {
  async signUp(req, res, next) {
    const {
      firstName,
      lastName,
      patronymic,
      email,
      password,
      confirmPassword,
      role,
      phoneNumber,
    } = req.body;

    if (password !== confirmPassword) {
      const error = HttpError.badRequest("Паролі не співпадають.");
      return next(error);
    }

    let existingUser;
    try {
      existingUser = await User.findOne({ where: { email } });
    } catch (err) {
      const error = HttpError.internalServerError(
        "Помилка під час реєстрації, будь ласка, спробуйте пізніше."
      );
      return next(error);
    }

    if (existingUser) {
      const error = HttpError.forbidden(
        "Користувач вже існує, будь ласка, увійдіть."
      );
      return next(error);
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      const error = HttpError.internalServerError(
        "Не вдалося створити користувача, спробуйте ще раз."
      );
      return next(error);
    }

    const createdUser = await User.create({
      firstName,
      lastName,
      patronymic,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
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
      const error = HttpError.internalServerError(
        "Не вдалося надіслати пін-код, повторіть спробу пізніше."
      );
      return next(error);
    }

    return res
      .status(201)
      .json({
        message: "Користувача успішно створено.",
        userId: createdUser.id,
      });
  }

  async logIn(req, res, next) {
    const { email, password } = req.body;

    let existingUser;
    try {
      existingUser = await User.findOne({ where: { email } });
    } catch (err) {
      const error = HttpError.internalServerError(
        "Не вдалося увійти, будь ласка, спробуйте пізніше."
      );
      return next(error);
    }

    if (!existingUser) {
      const error = HttpError.forbidden(
        "Невірні облікові дані, не вдалося увійти."
      );
      return next(error);
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      const error = HttpError.internalServerError(
        "Не вдалося увійти, будь ласка, перевірте свої облікові дані та спробуйте ще раз."
      );
      return next(error);
    }

    if (!isValidPassword) {
      const error = HttpError.forbidden(
        "Невірні облікові дані, не вдалося увійти."
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
      const error = HttpError.internalServerError(
        "Не вдалося надіслати пін-код, повторіть спробу пізніше."
      );
      return next(error);
    }

    return res.status(200).json({
      message: "Пін-код успішно відправлено.",
      userId: existingUser.id,
    });
  }

  async checkPinCode(req, res, next) {
    const { email, pinCode } = req.body;

    let existingUser;
    try {
      existingUser = await User.findOne({ where: { email } });
    } catch (err) {
      const error = HttpError.internalServerError(
        "Не вдалося перевірити пін-код, будь ласка, спробуйте пізніше."
      );
      return next(error);
    }

    if (!existingUser) {
      const error = HttpError.forbidden(
        "Користувача не знайдено, перевірте свою електронну пошту та спробуйте ще раз."
      );
      return next(error);
    }

    const isValidPinCode = await PinCodeService.checkPinCode(
      existingUser.id,
      pinCode
    );
    if (!isValidPinCode) {
      const error = HttpError.forbidden(
        "Неправильний пін-код, будь ласка, перевірте свій пін-код і спробуйте ще раз."
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
        "Не вдалося перевірити пін-код, будь ласка, спробуйте пізніше."
      );
      return next(error);
    }

    res.status(200).json({
      token,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      role: existingUser.role,
    });
  }

  async resendPinCode(req, res, next) {
    const { userId, email } = req.body;

    try {
      await PinCodeService.sendPinCode(userId, email);
      return res.status(200).json({ message: "Пін-код успішно відправлено." });
    } catch (err) {
      const error = HttpError.internalServerError(
        "Повторно відправити пін-код не вдалося, будь ласка, повторіть спробу пізніше."
      );
      return next(error);
    }
  }

  async getCurrentUserInfo(req, res, next) {
    const { userId } = req.userData;

    const existingUser = await User.findByPk(userId);

    if (!existingUser) {
      return HttpError.unauthorized("Неавторизований доступ.");
    }

    return res.status(200).json({
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      role: existingUser.role,
    });
  }
}

module.exports = new UserController();
