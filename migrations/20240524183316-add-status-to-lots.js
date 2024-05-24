"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Lots", "status", {
      type: Sequelize.DataTypes.ENUM("OPEN", "CLOSED", "PENDING"),
      defaultValue: "PENDING",
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Lots", "status");
  },
};
