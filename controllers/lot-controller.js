const { Lot, Bid, User, Category, AuctionHistory } = require("../models");
const HttpError = require("../errors/http-error");

const lotService = require("../services/lot-service");

class LotController {
  async createLot(req, res, next) {
    if (!req.files || req.files.length === 0) {
      return next(HttpError.badRequest("Зображення не надано."));
    }

    const {
      title,
      description,
      startingPrice,
      endDate,
      categoryId,
      buyNowPrice,
      bidIncrement,
      reservePrice,
    } = req.body;

    const existingLot = await Lot.findOne({ where: { title } });

    if (existingLot) {
      return next(
        HttpError.badRequest(
          "Лот з такою назвою вже існує. Будь ласка, виберіть іншу назву."
        )
      );
    }

    if (new Date(endDate) <= new Date()) {
      return next(
        HttpError.badRequest("Дата закінчення повинна бути у майбутньому.")
      );
    }

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return next(
        HttpError.badRequest(
          "Невірна категорія. Будь ласка, виберіть іншу категорію."
        )
      );
    }

    if (buyNowPrice && buyNowPrice <= startingPrice) {
      return next(
        HttpError.badRequest(
          "Ціна купівлі зараз повинна бути більшою за початкову ціну."
        )
      );
    }

    if (bidIncrement && bidIncrement <= 0) {
      return next(
        HttpError.badRequest("Крок ставки повинен бути позитивним числом.")
      );
    }

    if (reservePrice && reservePrice <= startingPrice) {
      return next(
        HttpError.badRequest(
          "Резервна ціна повинна бути більшою початковій ціні."
        )
      );
    }

    try {
      const newLot = await Lot.create({
        userId: req.userData.userId,
        title,
        description,
        startingPrice,
        currentPrice: startingPrice,
        endDate,
        imageUrls: req.files.map((file) => file.path),
        status: "PENDING",
        categoryId,
        buyNowPrice,
        bidIncrement,
        reservePrice,
        bidCount: 0,
      });

      res.status(201).json({ message: "Лот успішно створено.", lot: newLot });
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

    const {
      title,
      description,
      startingPrice,
      endDate,
      categoryId,
      buyNowPrice,
      bidIncrement,
      reservePrice,
      existingImages,
    } = req.body;

    const newImages = req.files;

    try {
      const lot = await Lot.findByPk(lotId);

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId !== req.userData.userId) {
        return next(
          HttpError.forbidden("Ви не маєте права редагувати цей лот.")
        );
      }

      if (lot.status === "OPEN") {
        if (
          startingPrice !== undefined ||
          buyNowPrice !== undefined ||
          bidIncrement !== undefined ||
          reservePrice !== undefined
        ) {
          return next(
            HttpError.badRequest(
              "Неможливо змінити ціни та крок ставки для відкритого лоту."
            )
          );
        }
      }

      if (title && lot.title !== title) {
        const existingLot = await Lot.findOne({ where: { title } });

        if (existingLot) {
          return next(
            HttpError.badRequest(
              "Лот з такою назвою вже існує. Будь ласка, виберіть іншу назву."
            )
          );
        }
      }

      if (endDate && new Date(endDate) <= new Date()) {
        return next(
          HttpError.badRequest("Дата закінчення повинна бути у майбутньому.")
        );
      }

      if (categoryId && categoryId !== lot.categoryId) {
        const category = await Category.findByPk(categoryId);

        if (!category) {
          return next(
            HttpError.badRequest(
              "Невірна категорія. Будь ласка, виберіть іншу категорію."
            )
          );
        }
      }

      if (
        buyNowPrice &&
        buyNowPrice <= (lot.currentPrice || lot.startingPrice)
      ) {
        return next(
          HttpError.badRequest(
            "Ціна купівлі зараз повинна бути більшою за поточну/початкову ціну."
          )
        );
      }

      if (bidIncrement && bidIncrement <= 0) {
        return next(
          HttpError.badRequest("Крок ставки повинен бути позитивним числом.")
        );
      }

      if (
        reservePrice &&
        reservePrice <= (lot.currentPrice || lot.startingPrice)
      ) {
        return next(
          HttpError.badRequest(
            "Резервна ціна повинна бути більшою або дорівнювати поточній/початковій ціні."
          )
        );
      }

      let updatedImageUrls = existingImages ? existingImages : lot.imageUrl;
      if (newImages && newImages.length > 0) {
        const newImagePaths = newImages.map((file) => file.path);
        updatedImageUrls = updatedImageUrls.concat(newImagePaths);
      }

      updatedImageUrls = updatedImageUrls.filter((url) =>
        existingImages.includes(url)
      );

      lot.title = title || lot.title;
      lot.description = description || lot.description;
      lot.startingPrice = startingPrice || lot.startingPrice;
      lot.endDate = endDate || lot.endDate;
      lot.imageUrls = updatedImageUrls;
      lot.categoryId = categoryId || lot.categoryId;
      lot.buyNowPrice = buyNowPrice || lot.buyNowPrice;
      lot.bidIncrement = bidIncrement || lot.bidIncrement;
      lot.reservePrice = reservePrice || lot.reservePrice;

      await lot.save();

      res.status(201).json({ message: "Лот успішно оновлено.", lot: lot });
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

    try {
      const lot = await Lot.findByPk(lotId);

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId !== req.userData.userId) {
        return next(HttpError.forbidden("Ви не маєте права видалити цей лот."));
      }

      if (lot.status === "OPEN") {
        return next(HttpError.badRequest("Неможливо видалити відкритий лот."));
      }

      if (lot.status === "CLOSED") {
        return next(HttpError.badRequest("Неможливо видалити закритий лот."));
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

    try {
      const lot = await Lot.findByPk(lotId);

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId !== req.userData.userId) {
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

  async getAllLots(req, res, next) {
    try {
      // const { sortBy, sortOrder, page, limit } = req.query;

      // const pageNum = isNaN(page) || page < 1 ? 1 : parseInt(page);
      // const limitNum = isNaN(limit) || limit < 1 ? 10 : parseInt(limit);

      const lots = await Lot.findAll({
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "firstName", "lastName"],
          },
          {
            model: Bid,
            include: [{ model: User }],
          },
        ],
        // order: [[sortBy || "createdAt", sortOrder || "DESC"]],
        // offset: (pageNum - 1) * limitNum,
        // limit: limitNum || 10,
      });

      // const total = await Lot.count();
      await lotService.closeLotArray(lots);

      res.status(200).json(lots);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати лоти. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async getLotById(req, res, next) {
    const lotId = req.params.id;

    try {
      const lot = await Lot.findByPk(lotId, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "firstName", "lastName"],
          },
          {
            model: Bid,
            include: [{ model: User }],
          },
        ],
      });

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      await lotService.closeLot(lot);

      res.status(200).json(lot);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати лот. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async getLotBids(req, res, next) {
    const lotId = req.params.id;

    try {
      const lot = await Lot.findByPk(lotId, {
        include: [
          {
            model: Bid,
            attributes: ["id", "amount", "createdAt"],
            include: [
              { model: User, attributes: ["id", "firstName", "lastName"] },
            ],
          },
        ],
      });

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      const bids = lot.Bids;
      res.json(bids);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати ставки для цього лоту. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async getLotHistory(req, res, next) {
    const lotId = req.params.id;

    try {
      const history = await AuctionHistory.findAll({
        where: { lotId },
        order: [["timestamp", "ASC"]],
      });

      res.json(history);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати історію лоту. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async buyNow(req, res, next) {
    try {
      const { lotId } = req.body;

      res.json({ redirectUrl: `http://localhost:3000/payment?lotId=${lotId}` });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося здійснити купівлю. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }
}

module.exports = new LotController();
