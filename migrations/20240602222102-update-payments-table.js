"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Payments", "type", {
      type: Sequelize.DataTypes.ENUM(
        "DEPOSIT",
        "PURCHASE",
        "WITHDRAWAL",
        "SALE"
      ),
      allowNull: false,
      defaultValue: "PURCHASE",
    });

    await queryInterface.changeColumn("Payments", "lotId", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Payments", "type");
    await queryInterface.changeColumn("Payments", "lotId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
