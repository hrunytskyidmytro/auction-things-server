const { Lot, User, Payment } = require("../models");
const stripeService = require("../services/stripe-service");
const paymentService = require("../services/payment-service");
const Decimal = require("decimal.js");
const HttpError = require("../errors/http-error");

class PaymentController {
  async createCheckoutSession(req, res, next) {
    const { lotId } = req.body;

    try {
      const lot = await Lot.findByPk(lotId);

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId === req.userData.userId) {
        return next(
          HttpError.forbidden("Ви не можете придбати свій власний лот.")
        );
      }

      let user;
      let price;
      if (lot.winnerId) {
        user = await User.findByPk(lot.winnerId);

        if (!user) {
          return next(HttpError.notFound("Переможець не знайдений."));
        }

        price = lot.currentPrice;
      } else {
        user = await User.findByPk(req.userData.userId);

        if (!user) {
          return next(HttpError.unauthorized("Користувач не авторизований."));
        }

        price = lot.buyNowPrice;
      }

      const session = await stripeService.createCheckoutSession(
        price,
        user,
        lot.title,
        process.env.CLIENT_URL + `/success-page?lotId=${lot.id}`,
        process.env.CLIENT_URL
      );

      res.send({ id: session.id });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }

  async confirmPurchase(req, res, next) {
    const { lotId } = req.body;

    try {
      const lot = await Lot.findByPk(lotId);

      if (!lot) {
        return next(HttpError.notFound("Лот не знайдено."));
      }

      if (lot.userId === req.userData.userId) {
        return next(
          HttpError.forbidden("Ви не можете придбати свій власний лот.")
        );
      }

      let user;
      let price;
      if (lot.winnerId) {
        user = await User.findByPk(lot.winnerId);

        if (!user) {
          return next(HttpError.notFound("Переможець не знайдений."));
        }

        price = lot.currentPrice;
      } else {
        user = await User.findByPk(req.userData.userId);

        if (!user) {
          return next(HttpError.unauthorized("Користувач не авторизований."));
        }

        price = lot.buyNowPrice;
      }

      await paymentService.confirmPayment(lot, user, price);

      res.send({ message: "Покупка успішно підтверджена." });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }

  async addFunds(req, res, next) {
    const { amount, payment_method_id } = req.body;

    try {
      const user = await User.findByPk(req.userData.userId);

      if (!user) {
        return next(HttpError.unauthorized("Користувач не авторизований."));
      }

      const customer = await stripeService.createCustomer(
        `${user.firstName} ${user.lastName}`,
        user.email
      );

      const paymentIntent = await stripeService.createPaymentIntent(
        amount,
        payment_method_id,
        customer.id,
        user.email
      );

      if (paymentIntent.status === "succeeded") {
        await Payment.create({
          amount,
          userId: user.id,
          lotId: null,
          status: "COMPLETED",
          type: "DEPOSIT",
          commission: 0.0,
        });

        const amountDecimal = new Decimal(amount);
        user.balance = new Decimal(user.balance);

        user.balance = user.balance.plus(amountDecimal);
        await user.save();
      }

      res.send({ id: paymentIntent.id });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }

  async withdrawFunds(req, res, next) {
    const { amount, payment_method_id } = req.body;

    try {
      const user = await User.findByPk(req.userData.userId);

      if (!user) {
        return next(HttpError.unauthorized("Користувач не авторизований."));
      }

      if (new Decimal(user.balance).isZero()) {
        return next(
          HttpError.forbidden("Баланс порожній. Ви не можете вивести кошти.")
        );
      }

      if (new Decimal(user.balance).lessThanOrEqualTo(new Decimal(amount))) {
        return next(
          HttpError.forbidden(
            "Недостатньо коштів на балансі. Ви не можете вивести цю суму."
          )
        );
      }

      const customer = await stripeService.createCustomer(
        `${user.firstName} ${user.lastName}`,
        user.email
      );

      const paymentIntent = await stripeService.createPaymentIntent(
        amount,
        payment_method_id,
        customer.id,
        user.email
      );

      if (paymentIntent.status === "succeeded") {
        const amountDecimal = new Decimal(amount);
        user.balance = new Decimal(user.balance);

        const commission = amountDecimal.times(0.05);
        const amountToSeller = amountDecimal.minus(commission);

        await Payment.create({
          amount,
          userId: user.id,
          lotId: null,
          status: "COMPLETED",
          type: "WITHDRAWAL",
          commission: commission,
        });

        user.balance = new Decimal(user.balance).minus(amountToSeller);
        await user.save();
      }

      res.send({ message: "Кошти успішно виведені на картку." });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }

  async getAllPayments(req, res, next) {
    try {
      const payments = await Payment.findAll({
        include: [
          {
            model: User,
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      });
      res.json(payments);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати платежі. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async deletePayment(req, res, next) {
    const paymentId = req.params.id;

    try {
      const payment = await Payment.findByPk(paymentId);

      if (!payment) {
        return next(HttpError.notFound("Платіж не знайдено."));
      }

      await payment.destroy();
      res.json({ message: "Платіж успішно видалено." });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося видалити платіж. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }
}

module.exports = new PaymentController();
