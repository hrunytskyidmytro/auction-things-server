const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");

const { parsePhoneNumberFromString } = require("libphonenumber-js");

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please enter your name",
        },
      },
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please enter your surname",
        },
      },
    },
    patronymic: {
      type: DataTypes.STRING,
      allowNull: true,
      // validate: {
      //   notNull: {
      //     msg: "Please enter your patronymic",
      //   },
      // },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please enter your password",
        },
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      // validate: {
      //   isValidPhoneNumber(value) {
      //     const phoneNumber = parsePhoneNumberFromString(
      //       `${this.countryCode} ${value}`,
      //       "UA"
      //     );
      //     if (!phoneNumber || !phoneNumber.isValid()) {
      //       throw new Error("Invalid phone number");
      //     }
      //   },
      // },
    },
    countryCode: {
      type: DataTypes.STRING,
      allowNull: true,
      // validate: {
      //   isValidCountryCode(value) {
      //     const phoneNumber = parsePhoneNumberFromString(
      //       `${value} ${this.phoneNumber}`,
      //       "UA"
      //     );
      //     if (!phoneNumber || !phoneNumber.isValid()) {
      //       throw new Error("Invalid country code or phone number");
      //     }
      //   },
      // },
    },
    pinCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pinCodeExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pinCodeAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    pinCodeSendAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    pinCodeSendAttemptResetTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    passwordResetAttemptsExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "User",
  }
);

module.exports = User;
