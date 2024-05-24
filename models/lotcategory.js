"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LotCategory extends Model {
    static associate(models) {
      LotCategory.belongsTo(models.Lot, { foreignKey: "lotId" });
      LotCategory.belongsTo(models.Category, { foreignKey: "categoryId" });
    }
  }
  LotCategory.init(
    {
      lotId: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "LotCategory",
      tableName: "LotCategories",
    }
  );
  return LotCategory;
};
