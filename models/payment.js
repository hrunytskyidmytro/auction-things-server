"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.User, { foreignKey: "userId" });
      Payment.belongsTo(models.Lot, { foreignKey: "lotId" });
    }
  }
  Payment.init(
    {
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      userId: DataTypes.INTEGER,
      lotId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED", "REFUNDED"),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("DEPOSIT", "PURCHASE", "WITHDRAWAL", "SALE"),
        allowNull: false,
        defaultValue: "PURCHASE",
      },
      commission: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      sessionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "Payments",
    }
  );
  return Payment;
};
