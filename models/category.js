"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Lot, { foreignKey: "categoryId", as: "lots" });
    }
  }
  Category.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "Categories",
    }
  );
  return Category;
};
