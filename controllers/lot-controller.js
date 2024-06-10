const { Lot, Bid, User, Category, AuctionHistory } = require("../models");
const { Op } = require("sequelize");
const lotService = require("../services/lot-service");
const emailService = require("../services/email-service");
const HttpError = require("../errors/http-error");
const { USER_ROLES } = require("../constants/role-constants");
const Decimal = require("decimal.js");

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

    try {
      const newLot = await Lot.create({
        userId: req.userData.userId,
        title,
        description,
        startingPrice,
        currentPrice: startingPrice,
        endDate,
        originalEndDate: endDate,
        imageUrls: req.files.map((file) => file.path),
        status: "OPEN",
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

    // const newImages = req.files;

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
        return next(
          HttpError.badRequest("Редагування відкритого лоту неможливе.")
        );
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

      // let updatedImageUrls = existingImages ? existingImages : lot.imageUrl;
      // if (newImages && newImages.length > 0) {
      //   const newImagePaths = newImages.map((file) => file.path);
      //   updatedImageUrls = updatedImageUrls.concat(newImagePaths);
      // }

      // updatedImageUrls = updatedImageUrls.filter((url) =>
      //   existingImages.includes(url)
      // );

      lot.title = title;
      lot.description = description;
      lot.startingPrice = startingPrice;
      lot.endDate = endDate;
      // lot.imageUrls = updatedImageUrls;
      lot.categoryId = categoryId;
      lot.buyNowPrice = buyNowPrice;
      lot.bidIncrement = bidIncrement;
      lot.reservePrice = reservePrice;

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

  async toggleLotStatus(req, res, next) {
    const lotId = req.params.id;

    try {
      const lot = await Lot.findByPk(lotId);

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (req.userData.role !== USER_ROLES.admin) {
        return next(
          HttpError.forbidden(
            "Ви не маєте дозволу на зміну статусу цього лоту."
          )
        );
      }

      const newStatus = lot.status === "OPEN" ? "CLOSED" : "OPEN";

      if (newStatus === "CLOSED") {
        lot.endDate = new Date();

        const bids = await lot.getBids();
        const losingBids = bids.filter(
          (bid) => bid.userId !== req.userData.userId
        );
        for (const bid of losingBids) {
          const losingUser = await User.findByPk(bid.userId);
          const amountDecimal = new Decimal(bid.amount);
          losingUser.balance = new Decimal(losingUser.balance);

          losingUser.balance = losingUser.balance.add(amountDecimal);
          await emailService.sendEmail(
            losingUser.email,
            "Вибачте!",
            `Лот було примусово закрито! Вибачте за незручності, кошти повернуто. Дякуємо за довіру!`
          );

          await losingUser.save();
        }
      } else if (newStatus === "OPEN") {
        lot.endDate = lot.originalEndDate;
      }

      lot.status = newStatus;

      await lot.save();

      res.json({ message: "Статус лоту успішно оновлено.", lot });
    } catch (error) {
      console.log(error.message);
      next(
        HttpError.internalServerError(
          "Не вдалося змінити статус лоту. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async getAllLots(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const sortBy = req.query.sortBy;
      const currentPriceFrom = parseFloat(req.query.currentPriceFrom);
      const currentPriceTo = parseFloat(req.query.currentPriceTo);
      const buyNowPriceFrom = parseFloat(req.query.buyNowPriceFrom);
      const buyNowPriceTo = parseFloat(req.query.buyNowPriceTo);
      const dateOption = req.query.dateOption;
      const categoryIds = req.query.categoryId
        ? req.query.categoryId.split(",")
        : [];
      const statuses = req.query.status ? req.query.status.split(",") : [];
      const search = req.query.search;

      let order = [];

      if (sortBy === "price_asc") {
        order = [["currentPrice", "ASC"]];
      } else if (sortBy === "price_desc") {
        order = [["currentPrice", "DESC"]];
      } else if (sortBy === "created_asc") {
        order = [["createdAt", "ASC"]];
      } else if (sortBy === "created_desc") {
        order = [["createdAt", "DESC"]];
      } else if (sortBy === "end_asc") {
        order = [["endDate", "ASC"]];
      } else if (sortBy === "end_desc") {
        order = [["endDate", "DESC"]];
      } else if (sortBy === "buy_now_asc") {
        order = [["buyNowPrice", "ASC"]];
      } else if (sortBy === "buy_now_desc") {
        order = [["buyNowPrice", "DESC"]];
      }

      let where = {};

      if (categoryIds.length > 0) {
        where.categoryId = {
          [Op.in]: categoryIds,
        };
      }

      if (statuses.length > 0) {
        where.status = {
          [Op.in]: statuses,
        };
      }

      if (!isNaN(currentPriceFrom) && !isNaN(currentPriceTo)) {
        where.currentPrice = {
          [Op.between]: [currentPriceFrom, currentPriceTo],
        };
      } else if (!isNaN(currentPriceFrom)) {
        where.currentPrice = { [Op.gte]: currentPriceFrom };
      } else if (!isNaN(currentPriceTo)) {
        where.currentPrice = { [Op.lte]: currentPriceTo };
      }

      if (!isNaN(buyNowPriceFrom) && !isNaN(buyNowPriceTo)) {
        where.buyNowPrice = { [Op.between]: [buyNowPriceFrom, buyNowPriceTo] };
      } else if (!isNaN(buyNowPriceFrom)) {
        where.buyNowPrice = { [Op.gte]: buyNowPriceFrom };
      } else if (!isNaN(buyNowPriceTo)) {
        where.buyNowPrice = { [Op.lte]: buyNowPriceTo };
      }

      if (dateOption && dateOption !== "all") {
        const currentDate = new Date();
        let startDateLot = new Date(currentDate);
        let endDateLot = new Date();

        if (dateOption === "24_hours") {
          endDateLot = new Date(currentDate);
          endDateLot.setHours(endDateLot.getHours() + 24);
        } else if (dateOption === "7_days") {
          endDateLot = new Date(currentDate);
          endDateLot.setDate(endDateLot.getDate() + 7);
        } else if (dateOption === "30_days") {
          endDateLot = new Date(currentDate);
          endDateLot.setDate(endDateLot.getDate() + 30);
        }

        where.endDate = {
          [Op.between]: [startDateLot, endDateLot],
        };
      }

      if (dateOption === "recently_sold") {
        const currentDate = new Date();
        const startDateLot = new Date(currentDate);
        const endDateLot = new Date(currentDate);
        endDateLot.setDate(endDateLot.getDate() - 7);

        where.endDate = {
          [Op.between]: [endDateLot, startDateLot],
        };
      }

      if (search) {
        where.title = { [Op.like]: `%${search}%` };
      }

      const { rows: lots, count: totalItems } = await Lot.findAndCountAll({
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
        where,
        limit,
        offset,
        order,
      });

      await lotService.closeLotArray(lots);

      res.status(200).json({
        lots: lots,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати лоти. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async getAllLotsForAdmin(req, res, next) {
    try {
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
      });

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

  async getLotsByUser(req, res, next) {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy;
    const search = req.query.search;
    const currentPriceFrom = parseFloat(req.query.currentPriceFrom);
    const currentPriceTo = parseFloat(req.query.currentPriceTo);
    const buyNowPriceFrom = parseFloat(req.query.buyNowPriceFrom);
    const buyNowPriceTo = parseFloat(req.query.buyNowPriceTo);
    const dateOption = req.query.dateOption;
    const categoryIds = req.query.categoryId
      ? req.query.categoryId.split(",")
      : [];
    const statuses = req.query.status ? req.query.status.split(",") : [];

    let order = [];

    if (sortBy === "price_asc") {
      order = [["currentPrice", "ASC"]];
    } else if (sortBy === "price_desc") {
      order = [["currentPrice", "DESC"]];
    } else if (sortBy === "created_asc") {
      order = [["createdAt", "ASC"]];
    } else if (sortBy === "created_desc") {
      order = [["createdAt", "DESC"]];
    } else if (sortBy === "end_asc") {
      order = [["endDate", "ASC"]];
    } else if (sortBy === "end_desc") {
      order = [["endDate", "DESC"]];
    } else if (sortBy === "buy_now_asc") {
      order = [["buyNowPrice", "ASC"]];
    } else if (sortBy === "buy_now_desc") {
      order = [["buyNowPrice", "DESC"]];
    }

    let where = {
      userId: userId,
    };

    if (categoryIds.length > 0) {
      where.categoryId = {
        [Op.in]: categoryIds,
      };
    }

    if (statuses.length > 0) {
      where.status = {
        [Op.in]: statuses,
      };
    }

    if (!isNaN(currentPriceFrom) && !isNaN(currentPriceTo)) {
      where.currentPrice = {
        [Op.between]: [currentPriceFrom, currentPriceTo],
      };
    } else if (!isNaN(currentPriceFrom)) {
      where.currentPrice = { [Op.gte]: currentPriceFrom };
    } else if (!isNaN(currentPriceTo)) {
      where.currentPrice = { [Op.lte]: currentPriceTo };
    }

    if (!isNaN(buyNowPriceFrom) && !isNaN(buyNowPriceTo)) {
      where.buyNowPrice = { [Op.between]: [buyNowPriceFrom, buyNowPriceTo] };
    } else if (!isNaN(buyNowPriceFrom)) {
      where.buyNowPrice = { [Op.gte]: buyNowPriceFrom };
    } else if (!isNaN(buyNowPriceTo)) {
      where.buyNowPrice = { [Op.lte]: buyNowPriceTo };
    }

    if (dateOption && dateOption !== "all") {
      const currentDate = new Date();
      let startDateLot = new Date(currentDate);
      let endDateLot = new Date();

      if (dateOption === "24_hours") {
        endDateLot = new Date(currentDate);
        endDateLot.setHours(endDateLot.getHours() + 24);
      } else if (dateOption === "7_days") {
        endDateLot = new Date(currentDate);
        endDateLot.setDate(endDateLot.getDate() + 7);
      } else if (dateOption === "30_days") {
        endDateLot = new Date(currentDate);
        endDateLot.setDate(endDateLot.getDate() + 30);
      }

      where.endDate = {
        [Op.between]: [startDateLot, endDateLot],
      };
    }

    if (dateOption === "recently_sold") {
      const currentDate = new Date();
      const startDateLot = new Date(currentDate);
      const endDateLot = new Date(currentDate);
      endDateLot.setDate(endDateLot.getDate() - 7);

      where.endDate = {
        [Op.between]: [endDateLot, startDateLot],
      };
    }

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    try {
      const { rows: lots, count: totalItems } = await Lot.findAndCountAll({
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
        where,
        limit,
        offset,
        order,
      });

      res.status(200).json({
        lots,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати лоти користувача. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async getLatestOpenLotsBySeller(req, res, next) {
    const userId = req.params.userId;

    try {
      const openLots = await Lot.findAll({
        where: {
          userId: userId,
          status: "OPEN",
        },
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
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(openLots);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати останні відкриті лоти продавця. Будь ласка, спробуйте пізніше."
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
