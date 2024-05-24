"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User, { foreignKey: "userId" });
      Review.belongsTo(models.Lot, { foreignKey: "lotId" });
    }
  }
  Review.init(
    {
      userId: DataTypes.INTEGER,
      lotId: DataTypes.INTEGER,
      rating: DataTypes.INTEGER,
      comment: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "Reviews",
    }
  );
  return Review;
};
