const { Lot } = require("../models");
const HttpError = require("../errors/http-error");

class LotController {
  async createLot(req, res, next) {
    const { title, description, startingPrice, endDate, imageUrl } = req.body;
    const userId = req.user.id;

    try {
      const newLot = await Lot.create({
        userId,
        title,
        description,
        startingPrice,
        currentPrice: startingPrice,
        endDate,
        imageUrl,
        status: "PENDING",
      });

      res.status(201).json(newLot);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося створити лот. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async updateLot(req, res, next) {
    const lotId = req.params.id;
    const userId = req.user.id;
    const { title, description, startingPrice, endDate, imageUrl } = req.body;

    try {
      const lot = await Lot.findByPk(lotId);

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId !== userId) {
        return next(
          HttpError.forbidden("Ви не маєте права редагувати цей лот.")
        );
      }

      lot.title = title || lot.title;
      lot.description = description || lot.description;
      lot.startingPrice = startingPrice || lot.startingPrice;
      lot.endDate = endDate || lot.endDate;
      lot.imageUrl = imageUrl || lot.imageUrl;

      await lot.save();

      res.json(lot);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося оновити лот. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async deleteLot(req, res, next) {
    const lotId = req.params.id;
    const userId = req.user.id;

    try {
      const lot = await Lot.findByPk(lotId);
      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId !== userId) {
        return next(HttpError.forbidden("Ви не маєте права видалити цей лот."));
      }

      await lot.destroy();
      res.json({ message: "Лот успішно видалено." });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося видалити лот. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async openLot(req, res, next) {
    const lotId = req.params.id;
    const userId = req.user.id;

    try {
      const lot = await Lot.findByPk(lotId);
      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId !== userId) {
        return next(
          HttpError.forbidden("У вас немає дозволу на відкриття цього лоту.")
        );
      }

      lot.status = "OPEN";
      await lot.save();

      res.json(lot);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося відкрити лот. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async closeLot(req, res, next) {
    const lotId = req.params.id;
    const userId = req.user.id;

    try {
      const lot = await Lot.findByPk(lotId);
      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId !== userId) {
        return next(
          HttpError.forbidden("У вас немає дозволу на закриття цього лоту.")
        );
      }

      lot.status = "CLOSED";
      await lot.save();

      res.json(lot);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося закрити лот. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async getAllLots(req, res, next) {
    try {
      const lots = await Lot.findAll();
      res.json(lots);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати лоти. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }
}

module.exports = new LotController();
