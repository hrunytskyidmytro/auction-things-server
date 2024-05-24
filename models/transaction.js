"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User, { foreignKey: "userId" });
      Transaction.belongsTo(models.Lot, { foreignKey: "lotId" });
    }
  }
  Transaction.init(
    {
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      userId: DataTypes.INTEGER,
      lotId: DataTypes.INTEGER,
      type: {
        type: DataTypes.ENUM("DEPOSIT", "WITHDRAWAL", "PURCHASE", "SALE"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED", "REFUNDED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
    },
    {
      sequelize,
      modelName: "Transaction",
      tableName: "Transactions",
    }
  );
  return Transaction;
};
