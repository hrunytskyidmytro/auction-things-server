"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bid extends Model {
    static associate(models) {
      Bid.belongsTo(models.User, { foreignKey: "userId" });
      Bid.belongsTo(models.Lot, { foreignKey: "lotId" });
    }
  }
  Bid.init(
    {
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      userId: DataTypes.INTEGER,
      itemId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Bid",
      tableName: "Bids",
    }
  );
  return Bid;
};
