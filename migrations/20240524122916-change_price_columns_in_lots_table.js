"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Lots", "startingPrice", {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    });

    await queryInterface.changeColumn("Lots", "currentPrice", {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Lots", "startingPrice", {
      type: Sequelize.DataTypes.FLOAT,
    });

    await queryInterface.changeColumn("Lots", "currentPrice", {
      type: Sequelize.DataTypes.FLOAT,
    });
  },
};
