"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Lots", "categoryId", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Categories",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("Lots", "buyNowPrice", {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: true,
    });

    await queryInterface.addColumn("Lots", "bidIncrement", {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: true,
    });

    await queryInterface.addColumn("Lots", "reservePrice", {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: true,
    });

    await queryInterface.addColumn("Lots", "bidCount", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("Lots", "winnerId", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Lots", "categoryId");
    await queryInterface.removeColumn("Lots", "buyNowPrice");
    await queryInterface.removeColumn("Lots", "bidIncrement");
    await queryInterface.removeColumn("Lots", "reservePrice");
    await queryInterface.removeColumn("Lots", "bidCount");
    await queryInterface.removeColumn("Lots", "winnerId");
  },
};
