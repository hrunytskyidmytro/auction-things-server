const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/user");

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
      throw new Error("User not found.");
    }

    if (user.pinCodeSendAttempts >= process.env.MAX_PIN_CODE_SEND_ATTEMPTS) {
      const timeLeft = user.pinCodeSendAttemptResetTime
        ? user.pinCodeSendAttemptResetTime.getTime() - new Date().getTime()
        : null;

      if (timeLeft > 0) {
        throw new Error(
          `You have exceeded the maximum number of attempts to send a pin code. Please try again in ${Math.ceil(
            timeLeft / 1000 / 60
          )} minutes.`
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
      subject: "Your pin code",
      text: `Your pin code is: ${pinCodeData.pinCode}`,
    };

    await transporter.sendMail(mailOptions);

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
    const currentTime = new Date();
    if (user.pinCodeExpiration && currentTime > user.pinCodeExpiration) {
      user.pinCode = null;
      user.pinCodeExpiration = null;
      user.pinCodeAttempts = 0;
      await user.save();
      return false;
    }
    user.pinCode = null;
    user.pinCodeExpiration = null;
    user.pinCodeAttempts = 0;
    await user.save();
    return true;
  }
}
module.exports = PinCodeService;
