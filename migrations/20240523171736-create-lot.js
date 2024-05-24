"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Lots", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      userId: {
        type: Sequelize.DataTypes.INTEGER,
      },
      title: {
        type: Sequelize.DataTypes.STRING,
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
      },
      startingPrice: {
        type: Sequelize.DataTypes.FLOAT,
      },
      currentPrice: {
        type: Sequelize.DataTypes.FLOAT,
      },
      endDate: {
        type: Sequelize.DataTypes.DATE,
      },
      imageUrl: {
        type: Sequelize.DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Lots");
  },
};
