"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("AuctionHistories", "timestamp");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("AuctionHistories", "timestamp", {
      type: Sequelize.DataTypes.DATE,
    });
  },
};
