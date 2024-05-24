"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Transactions", "status", {
      type: Sequelize.DataTypes.ENUM(
        "PENDING",
        "COMPLETED",
        "FAILED",
        "REFUNDED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Transactions", "status", {
      type: Sequelize.DataTypes.STRING,
    });
  },
};
