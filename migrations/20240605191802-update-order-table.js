"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "status", {
      type: Sequelize.DataTypes.ENUM("COMPLETED", "PROCESSING", "CANCELLED"),
      allowNull: false,
      defaultValue: "PROCESSING",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "status");
  },
};
