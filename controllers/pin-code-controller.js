const bcrypt = require("bcrypt");

const { User } = require("../models");

const emailService = require("../services/email-service");

class PinCodeService {
  static async generatePinCode() {
    const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    return { pinCode, expiration };
  }

  static async savePinCode(userId, pinCodeData) {
    const { pinCode, expiration } = pinCodeData;
    const hashedPinCode = await bcrypt.hash(pinCode, 10);
    const user = await User.findByPk(userId);
    user.pinCode = hashedPinCode;
    user.pinCodeExpiration = expiration;
    user.pinCodeAttempts = 0;
    await user.save();
  }

  static async sendPinCode(userId, email) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("Користувача не знайдено.");
    }

    if (user.pinCodeSendAttempts >= process.env.MAX_PIN_CODE_SEND_ATTEMPTS) {
      const timeLeft = user.pinCodeSendAttemptResetTime
        ? user.pinCodeSendAttemptResetTime.getTime() - new Date().getTime()
        : null;

      if (timeLeft > 0) {
        throw new Error(
          `Ви перевищили максимальну кількість спроб надіслати пін-код. Будь ласка, спробуйте ще раз через ${Math.ceil(
            timeLeft / 1000 / 60
          )} хвилин.`
        );
      } else {
        user.pinCodeSendAttempts = 0;
        user.pinCodeSendAttemptResetTime = new Date();
        user.pinCodeSendAttemptResetTime.setTime(
          user.pinCodeSendAttemptResetTime.getTime() + 60 * 60 * 1000
        );
        await user.save();
      }
    }

    const pinCodeData = await this.generatePinCode();
    await this.savePinCode(userId, pinCodeData);

    await emailService.sendEmail(
      email,
      "Ваш пін-код",
      `Ваш пін-код: ${pinCodeData.pinCode}`
    );

    user.pinCodeSendAttempts += 1;
    await user.save();
  }

  static async checkPinCode(userId, enteredPinCode) {
    const user = await User.findByPk(userId);
    if (!user.pinCode) {
      return false;
    }
    const isMatch = await bcrypt.compare(enteredPinCode, user.pinCode);
    if (!isMatch) {
      user.pinCodeAttempts += 1;
      if (user.pinCodeAttempts >= 3) {
        user.pinCode = null;
        user.pinCodeExpiration = null;
        user.pinCodeAttempts = 0;
        await user.save();
        return false;
      }
      await user.save();
      return false;
    }
    user.pinCode = null;
    user.pinCodeExpiration = null;
    user.pinCodeAttempts = 0;
    user.pinCodeSendAttempts = 0;
    await user.save();
    return true;
  }
}

module.exports = PinCodeService;
