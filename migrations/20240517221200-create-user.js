'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      patronymic: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING
      },
      phoneNumber: {
        type: Sequelize.STRING
      },
      pinCode: {
        type: Sequelize.STRING
      },
      pinCodeExpiration: {
        type: Sequelize.DATE
      },
      pinCodeAttempts: {
        type: Sequelize.INTEGER
      },
      pinCodeSendAttempts: {
        type: Sequelize.INTEGER
      },
      pinCodeSendAttemptResetTime: {
        type: Sequelize.DATE
      },
      resetPasswordToken: {
        type: Sequelize.STRING
      },
      resetPasswordExpiration: {
        type: Sequelize.DATE
      },
      passwordResetAttempts: {
        type: Sequelize.INTEGER
      },
      passwordResetAttemptsExpiration: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};