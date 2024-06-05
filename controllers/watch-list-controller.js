const { Watchlist, Lot } = require("../models");
const HttpError = require("../errors/http-error");

class WatchlistController {
  async getWatchlistByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      const watchlist = await Watchlist.findAll({
        where: { userId },
        include: [
          {
            model: Lot,
            as: "Lot",
            attributes: ["id", "title", "currentPrice", "endDate", "imageUrls"],
          },
        ],
      });

      res.status(200).json(watchlist);
    } catch (error) {
      next(HttpError.internalServerError(error.message));
    }
  }

  async addToWatchlist(req, res, next) {
    try {
      const { userId, lotId } = req.body;
      const watchlist = await Watchlist.create({ userId, lotId });
      res.status(201).json(watchlist);
    } catch (error) {
      next(HttpError.internalServerError(error.message));
    }
  }

  async checkWatchlist(req, res, next) {
    const userId = req.userData.userId;
    const lotId = req.params.id;

    try {
      const watchlist = await Watchlist.findOne({
        where: { lotId, userId },
      });

      res.status(200).json({ exist: !!watchlist });
    } catch (error) {
      next(HttpError.internalServerError(error.message));
    }
  }

  async deleteFromWatchlist(req, res, next) {
    try {
      const { userId, lotId } = req.body;
      const watchlist = await Watchlist.findOne({
        where: { lotId, userId },
      });

      await watchlist.destroy();

      res
        .status(200)
        .json({ message: "Лот успішно видалено зі списку спостереження." });
    } catch (error) {
      next(HttpError.internalServerError(error.message));
    }
  }
}

module.exports = new WatchlistController();
