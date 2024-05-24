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
      lotId: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "COMPLETED",
          "FAILED",
          "REFUNDED"
        ),
        allowNull: false,
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
