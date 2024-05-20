"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "firstName", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Будь ласка, введіть своє ім'я.",
        },
        len: {
          args: [2, 32],
          msg: "Ім'я повинно містити від 2 до 32 символів.",
        },
      },
    });

    await queryInterface.changeColumn("Users", "lastName", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Будь ласка, введіть своє прізвище.",
        },
        len: {
          args: [2, 32],
          msg: "Прізвище повинно містити від 2 до 32 символів.",
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "firstName", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Будь ласка, введіть своє ім'я.",
        },
      },
    });

    await queryInterface.changeColumn("Users", "lastName", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Будь ласка, введіть своє прізвище.",
        },
      },
    });
  },
};
