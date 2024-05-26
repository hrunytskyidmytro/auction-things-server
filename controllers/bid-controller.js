const { Bid, Lot, AuctionHistory } = require("../models");
const HttpError = require("../errors/http-error");

class BidController {
  async createBid(req, res, next) {
    const { amount } = req.body;
    const lotId = req.params.id;

    try {
      const lot = await Lot.findByPk(lotId);

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId === req.userData.userId) {
        return next(
          HttpError.forbidden("Ви не можете робити ставки на свій власний лот.")
        );
      }

      if (lot.status !== "OPEN") {
        return next(
          HttpError.forbidden(
            "Ставки приймаються лише для лотів зі статусом 'Відкритий'."
          )
        );
      }

      if (amount <= lot.currentPrice) {
        return next(
          HttpError.badRequest(
            "Сума ставки повинна бути більшою за поточну ціну лоту."
          )
        );
      }

      const newBid = await Bid.create({
        amount,
        userId: req.userData.userId,
        lotId,
      });

      const oldPrice = lot.currentPrice;
      lot.currentPrice = amount;
      await lot.save();

      await AuctionHistory.create({
        lotId,
        bidId: newBid.id,
        oldPrice,
        newPrice: amount,
      });

      res
        .status(201)
        .json({ message: "Ставка успішно створена.", bid: newBid });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося створити ставку. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }
}

module.exports = new BidController();
