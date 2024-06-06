"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Lot extends Model {
    static associate(models) {
      Lot.hasMany(models.Bid, { foreignKey: "lotId" });
      Lot.hasMany(models.AuctionHistory, { foreignKey: "lotId" });
      Lot.belongsToMany(models.User, {
        through: "Watchlist",
        foreignKey: "lotId",
        as: "watchlistUsers",
      });
      Lot.belongsTo(models.User, {
        foreignKey: "userId",
        as: "creator",
      });
      Lot.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
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
      imageUrls: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("OPEN", "CLOSED", "PENDING"),
        defaultValue: "PENDING",
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      buyNowPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      bidIncrement: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      reservePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      bidCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      winnerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
