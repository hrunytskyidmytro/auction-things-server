"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Transactions", "type", {
      type: Sequelize.DataTypes.ENUM(
        "DEPOSIT",
        "WITHDRAWAL",
        "PURCHASE",
        "SALE"
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Transactions", "type", {
      type: Sequelize.DataTypes.STRING,
    });
  },
};
