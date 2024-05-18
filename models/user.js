"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Будь ласка, введіть своє ім'я.",
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Будь ласка, введіть своє прізвище.",
          },
        },
      },
      patronymic: {
        type: DataTypes.STRING,
        allowNull: true,
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
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "Users",
    }
  );
  return User;
};
