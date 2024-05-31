const { Watchlist } = require("../models");
const HttpError = require("../errors/http-error");

class WatchlistController {
  async getWatchlist(req, res, next) {
    try {
      const { userId } = req.params;
      const watchlist = await Watchlist.findAll({ where: { userId } });
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
}

module.exports = new WatchlistController();
