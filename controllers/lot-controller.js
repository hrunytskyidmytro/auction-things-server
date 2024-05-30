const { Lot, Bid, User, Category, AuctionHistory } = require("../models");
const HttpError = require("../errors/http-error");

const nodemailer = require("nodemailer");

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

    if (new Date(endDate) <= new Date()) {
      return next(
        HttpError.badRequest("Дата закінчення повинна бути у майбутньому.")
      );
    }

    const existingLot = await Lot.findOne({ where: { title } });

    if (existingLot) {
      return next(
        HttpError.badRequest(
          "Лот з такою назвою вже існує. Будь ласка, виберіть іншу назву."
        )
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

  async closeLot(req, res, next) {
    const lotId = req.params.id;

    try {
      const lot = await Lot.findByPk(lotId, {
        include: [Bid],
      });

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId !== req.userData.userId) {
        return next(
          HttpError.forbidden("У вас немає дозволу на закриття цього лоту.")
        );
      }

      const bids = lot.Bids;
      if (bids.length > 0) {
        const highestBid = bids.reduce(
          (max, bid) => (bid.amount > max.amount ? bid : max),
          bids[0]
        );
        lot.winnerId = highestBid.userId;
      }

      lot.status = "CLOSED";
      await lot.save();

      if (lot.winnerId) {
        const winner = await User.findByPk(lot.winnerId);
        await this.sendEmail(
          winner.email,
          "Вітаємо!",
          `Ви виграли лот: ${lot.title}`
        );
      }

      const losingBids = bids.filter((bid) => bid.userId !== lot.winnerId);
      for (const bid of losingBids) {
        const user = await User.findByPk(bid.userId);
        await this.sendEmail(
          user.email,
          "Дякуємо за участь.",
          `Ви не виграли лот: ${lot.title}`
        );
      }

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
      const lots = await Lot.findAll({
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      });
      res.json(lots);
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
          // {
          //   model: Category,
          //   as: "category",
          //   attributes: ["id", "name", "description"],
          // },
          {
            model: User,
            as: "creator",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      });

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      res.status(200).json(lot);
    } catch (error) {
      console.log(error.message);
      next(
        HttpError.internalServerError(
          "Не вдалося отримати лот. Будь ласка, спробуйте пізніше."
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

  async sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      text,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("Не вдалося надіслати електронного листа:", error);
    }
  }
}

module.exports = new LotController();
