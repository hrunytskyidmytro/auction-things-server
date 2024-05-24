"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Watchlist extends Model {
    static associate(models) {
      Watchlist.belongsTo(models.User, { foreignKey: "userId" });
      Watchlist.belongsTo(models.Lot, { foreignKey: "lotId" });
    }
  }
  Watchlist.init(
    {
      userId: DataTypes.INTEGER,
      lotId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Watchlist",
      tableName: "Watchlists",
    }
  );
  return Watchlist;
};
