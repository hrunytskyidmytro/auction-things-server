"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AuctionHistory extends Model {
    static associate(models) {
      AuctionHistory.belongsTo(models.Lot, { foreignKey: "lotId" });
      AuctionHistory.belongsTo(models.Bid, { foreignKey: "bidId" });
    }
  }
  AuctionHistory.init(
    {
      lotId: DataTypes.INTEGER,
      bidId: DataTypes.INTEGER,
      oldPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      newPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      sequelize,
      modelName: "AuctionHistory",
      tableName: "AuctionHistories",
    }
  );
  return AuctionHistory;
};
