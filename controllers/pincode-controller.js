const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/user");

class PinCodeService {
  static async generatePinCode() {
    const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
    return pinCode;
  }

  static async savePinCode(userId, pinCode) {
    const hashedPinCode = await bcrypt.hash(pinCode, 10);
    const user = await User.findByPk(userId);
    user.pinCode = hashedPinCode;
    await user.save();
  }

  static async sendPinCode(userId, email, pinCode) {
    await this.savePinCode(userId, pinCode);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ipz203_gds@student.ztu.edu.ua",
        pass: "rufv jvlz xsoe lzre",
      },
    });

    const mailOptions = {
      from: "ipz203_gds@student.ztu.edu.ua",
      to: email,
      subject: "Your pin code",
      text: `Your pin code is: ${pinCode}`,
    };

    await transporter.sendMail(mailOptions);
  }

  static async checkPinCode(userId, enteredPinCode) {
    const user = await User.findByPk(userId);
    const isMatch = await bcrypt.compare(enteredPinCode, user.pinCode);
    return isMatch;
  }
}
module.exports = PinCodeService;
