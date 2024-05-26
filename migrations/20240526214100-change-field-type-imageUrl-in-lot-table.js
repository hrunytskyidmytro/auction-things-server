"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Lots", "imageUrls", {
      type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
      allowNull: true,
    });

    await queryInterface.removeColumn("Lots", "imageUrl");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Lots", "imageUrl", {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn("Lots", "imageUrls");
  },
};
