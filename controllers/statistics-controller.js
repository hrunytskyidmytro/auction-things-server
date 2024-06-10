const { User, Lot, Bid, Order, sequelize } = require("../models");
const { Op } = require("sequelize");
const HttpError = require("../errors/http-error");

class StatisticsController {
  async getStatistics(req, res, next) {
    try {
      const totalUsers = await User.count();
      const activeLots = await Lot.count({ where: { status: "OPEN" } });
      const completedLots = await Lot.count({ where: { status: "CLOSED" } });
      const totalBids = await Bid.count();
      const processingOrders = await Order.count({
        where: { status: "PROCESSING" },
      });
      const averageBid = await Bid.findAll({
        attributes: [
          [sequelize.fn("AVG", sequelize.col("amount")), "avgAmount"],
        ],
      });

      const now = new Date();
      const last30Days = new Date(now.setDate(now.getDate() - 30));

      const bidsLast30Days = await Bid.findAll({
        where: {
          createdAt: { [Op.between]: [last30Days, new Date()] },
        },
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["date"],
        order: [[sequelize.literal("date"), "ASC"]],
      });

      const processingOrdersLast30Days = await Order.findAll({
        where: {
          status: "PROCESSING",
          createdAt: { [Op.between]: [last30Days, new Date()] },
        },
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: ["date"],
        order: [[sequelize.literal("date"), "ASC"]],
      });

      const bidsCount = bidsLast30Days.map((bid) => bid.dataValues.count);
      const bidDates = bidsLast30Days.map((bid) => bid.dataValues.date);
      const processingOrdersCount = processingOrdersLast30Days.map(
        (order) => order.dataValues.count
      );
      const processingOrderDates = processingOrdersLast30Days.map(
        (order) => order.dataValues.date
      );

      const activeLotsLast30DaysData = await Lot.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: {
          status: "OPEN",
          createdAt: { [Op.between]: [last30Days, new Date()] },
        },
        group: ["date"],
        order: [[sequelize.literal("date"), "ASC"]],
      });

      const activeLotsLast30Days = activeLotsLast30DaysData.map(
        (data) => data.dataValues.count
      );

      const newUsers = await User.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: {
          createdAt: { [Op.between]: [last30Days, new Date()] },
        },
        group: ["date"],
        order: [[sequelize.literal("date"), "ASC"]],
      });

      const revenue = await Bid.sum("amount", {
        where: { createdAt: { [Op.between]: [last30Days, new Date()] } },
      });

      const newUsersData = newUsers.map((user) => ({
        date: user.dataValues.date,
        count: user.dataValues.count,
      }));

      const newUsersWithRevenue = newUsersData.map((user) => ({
        date: user.date,
        newUsersCount: user.count,
        revenue: revenue[bidDates.indexOf(user.date)] || 0,
      }));

      res.json({
        totalUsers,
        activeLots,
        completedLots,
        totalBids,
        processingOrders,
        averageBid: averageBid[0].dataValues.avgAmount,
        bidsCount,
        bidDates,
        processingOrdersCount,
        processingOrderDates,
        newUsersData: newUsersWithRevenue,
        revenue,
        activeLotsLast30Days,
      });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати статистику. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }
}

module.exports = new StatisticsController();
