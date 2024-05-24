"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Lot extends Model {
    static associate(models) {
      Lot.hasMany(models.Bid, { foreignKey: "lotId" });
      Lot.belongsToMany(models.Category, {
        through: "LotCategories",
        foreignKey: "lotId",
        as: "categories",
      });
      Lot.hasMany(models.AuctionHistory, { foreignKey: "lotId" });
      Lot.belongsToMany(models.User, {
        through: "Watchlist",
        foreignKey: "lotId",
        as: "watchlistUsers",
      });
    }
  }
  Lot.init(
    {
      userId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      startingPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      currentPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      endDate: DataTypes.DATE,
      imageUrl: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("OPEN", "CLOSED", "PENDING"),
        defaultValue: "PENDING",
      },
    },
    {
      sequelize,
      modelName: "Lot",
      tableName: "Lots",
    }
  );
  return Lot;
};
