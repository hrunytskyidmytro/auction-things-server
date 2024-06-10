const { AuctionHistory, Lot, Bid } = require("../models");
const HttpError = require("../errors/http-error");

class AuctionHistoryController {
  async getAllAuctionHistories(req, res, next) {
    try {
      const auctionHistories = await AuctionHistory.findAll({
        include: [
          {
            model: Lot,
            attributes: ["id", "title"],
          },
          {
            model: Bid,
            attributes: ["id", "amount"],
          },
        ],
      });

      res.json(auctionHistories);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати історію лотів. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async getAuctionHistoryById(req, res, next) {
    const auctionHistoryId = req.params.id;

    try {
      const auctionHistory = await AuctionHistory.findByPk(auctionHistoryId);

      if (!auctionHistory) {
        return next(HttpError.notFound("Історію даного лоту не знайдено."));
      }

      res.status(200).json(auctionHistory);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати істрію даного лоту. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async deleteAuctionHistory(req, res, next) {
    const auctionHistoryId = req.params.id;

    try {
      const auctionHistory = await AuctionHistory.findByPk(auctionHistoryId);

      if (!auctionHistory) {
        return next(HttpError.notFound("Історія лоту не знайдено."));
      }

      await auctionHistory.destroy();
      res.json({ message: "Історію успішно видалено." });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося видалити історію. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }
}

module.exports = new AuctionHistoryController();
