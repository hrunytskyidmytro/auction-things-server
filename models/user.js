"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Bid, { foreignKey: "userId" });
      User.hasMany(models.Payment, { foreignKey: "userId" });
      User.hasMany(models.Notification, { foreignKey: "userId" });
      User.hasMany(models.Review, { foreignKey: "userId" });
      User.hasMany(models.Lot, { foreignKey: "userId" });
      User.hasMany(models.Transaction, { foreignKey: "userId" });
      User.belongsToMany(models.Lot, {
        through: "Watchlist",
        foreignKey: "userId",
        as: "watchlistLots",
      });
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
          len: {
            args: [2, 32],
            msg: "Ім'я повинно містити від 2 до 32 символів.",
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
          len: {
            args: [2, 32],
            msg: "Прізвище повинно містити від 2 до 32 символів.",
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
        type: DataTypes.ENUM("BUYER", "SELLER", "ADMIN"),
        allowNull: false,
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
      companyName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      companySite: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      position: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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
