"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "firstName", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Будь ласка, введіть своє ім'я.",
        },
      },
    });
    await queryInterface.changeColumn("Users", "lastName", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Будь ласка, введіть своє прізвище.",
        },
      },
    });
    await queryInterface.changeColumn("Users", "patronymic", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "email", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    });
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "phoneNumber", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "pinCode", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "pinCodeExpiration", {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "pinCodeAttempts", {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.changeColumn("Users", "pinCodeSendAttempts", {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.changeColumn("Users", "pinCodeSendAttemptResetTime", {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "resetPasswordToken", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "resetPasswordExpiration", {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "passwordResetAttempts", {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.changeColumn("Users", "passwordResetAttemptsExpiration", {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "firstName", {
      type: Sequelize.DataTypes.STRING,
    });
    await queryInterface.changeColumn("Users", "lastName", {
      type: Sequelize.DataTypes.STRING,
    });
    await queryInterface.changeColumn("Users", "patronymic", {
      type: Sequelize.DataTypes.STRING,
    });
    await queryInterface.changeColumn("Users", "email", {
      type: Sequelize.DataTypes.STRING,
    });
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.DataTypes.STRING,
    });
    await queryInterface.changeColumn("Users", "role", {
      type: Sequelize.DataTypes.STRING,
    });
    await queryInterface.changeColumn("Users", "phoneNumber", {
      type: Sequelize.DataTypes.STRING,
    });
    await queryInterface.changeColumn("Users", "pinCode", {
      type: Sequelize.DataTypes.STRING,
    });
    await queryInterface.changeColumn("Users", "pinCodeExpiration", {
      type: Sequelize.DataTypes.DATE,
    });
    await queryInterface.changeColumn("Users", "pinCodeAttempts", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.changeColumn("Users", "pinCodeSendAttempts", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.changeColumn("Users", "pinCodeSendAttemptResetTime", {
      type: Sequelize.DataTypes.DATE,
    });
    await queryInterface.changeColumn("Users", "resetPasswordToken", {
      type: Sequelize.DataTypes.STRING,
    });
    await queryInterface.changeColumn("Users", "resetPasswordExpiration", {
      type: Sequelize.DataTypes.DATE,
    });
    await queryInterface.changeColumn("Users", "passwordResetAttempts", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.changeColumn("Users", "passwordResetAttemptsExpiration", {
      type: Sequelize.DataTypes.DATE,
    });
  },
};
