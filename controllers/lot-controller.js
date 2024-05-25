const { Lot, Bid, User } = require("../models");
const HttpError = require("../errors/http-error");

const nodemailer = require("nodemailer");

class LotController {
  async createLot(req, res, next) {
    if (!req.file) {
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
    const userId = req.user.id;

    try {
      const newLot = await Lot.create({
        userId,
        title,
        description,
        startingPrice,
        currentPrice: startingPrice,
        endDate,
        imageUrl: req.file.path,
        status: "PENDING",
        categoryId,
        buyNowPrice,
        bidIncrement,
        reservePrice,
        bidCount: 0,
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
    const {
      title,
      description,
      startingPrice,
      endDate,
      imageUrl,
      categoryId,
      buyNowPrice,
      bidIncrement,
      reservePrice,
    } = req.body;

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
      lot.categoryId = categoryId || lot.categoryId;
      lot.buyNowPrice = buyNowPrice || lot.buyNowPrice;
      lot.bidIncrement = bidIncrement || lot.bidIncrement;
      lot.reservePrice = reservePrice || lot.reservePrice;

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
      const lot = await Lot.findByPk(lotId, {
        include: [Bid],
      });
      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId !== userId) {
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
