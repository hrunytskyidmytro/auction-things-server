"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Notification.init(
    {
      userId: DataTypes.INTEGER,
      message: DataTypes.STRING,
      isRead: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "Notifications",
    }
  );
  return Notification;
};
