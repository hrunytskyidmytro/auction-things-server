'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AuctionHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER
      },
      lotId: {
        type: Sequelize.DataTypes.INTEGER
      },
      bidId: {
        type: Sequelize.DataTypes.INTEGER
      },
      oldPrice: {
        type: Sequelize.DataTypes.FLOAT
      },
      newPrice: {
        type: Sequelize.DataTypes.FLOAT
      },
      timestamp: {
        type: Sequelize.DataTypes.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AuctionHistories');
  }
};