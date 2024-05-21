const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const { User } = require("../models");
const HttpError = require("../errors/http-error");

class PasswordResetController {
  async requestPasswordReset(req, res, next) {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено." });
    }

    const currentTime = new Date();

    if (
      user.passwordResetAttempts >= process.env.MAX_PASSWORD_RESET_ATTEMPTS ||
      user.passwordResetAttemptsExpiration > currentTime
    ) {
      user.passwordResetAttemptsExpiration = new Date();
      user.passwordResetAttemptsExpiration.setMinutes(
        user.passwordResetAttemptsExpiration.getMinutes() + 60
      );
      await user.save();

      return res.status(400).json({
        message: `Ви перевищили максимальну кількість спроб скидання пароля. Будь ласка, спробуйте ще раз через ${Math.ceil(
          (user.passwordResetAttemptsExpiration - currentTime) / 60000
        )} хвилин.`,
      });
    }

    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiration = new Date();
    user.resetPasswordExpiration.setHours(
      user.resetPasswordExpiration.getHours() + 1
    );
    user.passwordResetAttempts += 1;
    user.passwordResetAttemptsExpiration = currentTime;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Запит на зміну пароля.",
      html: `<p>Натисніть <a href="http://localhost:3000/reset-password/${resetPasswordToken}">сюди</a> щоб скинути пароль. Термін дії цього посилання закінчується через 1 годину, і ним можна скористатися лише один раз. Якщо ви вже змінили пароль, будь ласка, ігноруйте цей лист.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "Запит на скидання пароля успішно надіслано." });
  }

  async resetPassword(req, res, next) {
    const { resetPasswordToken, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      const error = HttpError.badRequest("Паролі не збігаються.");
      return next(error);
    }

    const user = await User.findOne({
      where: {
        resetPasswordToken,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено." });
    }

    if (!user.resetPasswordToken || user.resetPasswordExpiration < new Date()) {
      return res.status(400).json({
        message:
          "Токен скидання пароля недійсний або термін його дії закінчився.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiration = null;
    user.passwordResetAttempts = 0;
    user.passwordResetAttemptsExpiration = null;
    await user.save();

    return res
      .status(200)
      .json({ message: "Скидання пароля відбулося успішно." });
  }
}

module.exports = new PasswordResetController();
