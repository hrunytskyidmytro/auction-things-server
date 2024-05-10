const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const User = require("../models/user");
const HttpError = require("../errors/http-error");

class PasswordResetController {
  async requestPasswordReset(req, res, next) {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
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
        message: `You have exceeded the maximum number of password reset attempts. Please try again in ${Math.ceil(
          (user.passwordResetAttemptsExpiration - currentTime) / 60000
        )} minutes.`,
      });
    }

    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    const hashedResetPasswordToken = await bcrypt.hash(resetPasswordToken, 10);

    user.resetPasswordToken = hashedResetPasswordToken;
    user.resetPasswordExpiration = new Date();
    user.resetPasswordExpiration.setHours(
      user.resetPasswordExpiration.getHours() + 1
    );
    user.passwordResetAttempts += 1;
    user.passwordResetAttemptsExpiration = currentTime;
    await user.save();

    setTimeout(async () => {
      user.resetPasswordToken = null;
      user.resetPasswordExpiration = null;
      user.passwordResetAttempts = 0;
      user.passwordResetAttemptsExpiration = null;
      await user.save();
    }, 1 * 60 * 60 * 1000);

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
      subject: "Password reset request.",
      html: `<p>Click <a href="http://localhost:3000/reset-password/${hashedResetPasswordToken}">here</a> to reset your password. This link will expire in 1 hour and can only be used once. If you have already reset your password, please ignore this email.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Password reset token sent." });
  }

  async resetPassword(req, res, next) {
    const { resetPasswordToken, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      const error = HttpError.badRequest("Passwords do not match.");
      return next(error);
    }

    const user = await User.findOne({ where: { resetPasswordToken } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.resetPasswordToken || user.resetPasswordExpiration < new Date()) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiration = null;
    user.passwordResetAttempts = 0;
    user.passwordResetAttemptsExpiration = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful." });
  }
}

module.exports = new PasswordResetController();
