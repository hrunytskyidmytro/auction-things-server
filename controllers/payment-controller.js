const { Lot, User, Payment } = require("../models");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripeService = require("../services/stripe-service");

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

      let user;
      if (lot.winnerId) {
        user = await User.findByPk(lot.winnerId);

        if (!user) {
          return next(HttpError.notFound("Переможець не знайдений."));
        }
      } else {
        // user = req.userData.userId;
        user = await User.findByPk(req.userData.userId);

        if (!user) {
          return next(HttpError.unauthorized("Користувач не авторизований."));
        }
      }

      const session = await stripeService.createCheckoutSession(
        lot.buyNowPrice,
        user,
        lot.title,
        "http://localhost:3000/",
        "http://localhost:3000/"
      );

      if (lot.status !== "CLOSED") {
        lot.status = "CLOSED";
        lot.winnerId = user.id;
        await lot.save();

        lot.buyNowPrice = new Decimal(lot.buyNowPrice);
        const commission = lot.buyNowPrice.times(0.05);
        const amountToSeller = lot.buyNowPrice.minus(commission);

        const seller = await User.findByPk(lot.userId);
        seller.balance = new Decimal(amountToSeller);
        await seller.save();

        await Payment.create({
          amount: lot.buyNowPrice,
          userId: seller.id,
          lotId: lot.id,
          status: "COMPLETED",
          type: "SALE",
          commission: commission,
          sessionId: session.id,
        });
      }

      const bids = await lot.getBids();
      const losingBids = bids.filter((bid) => bid.userId !== user.id);

      for (const bid of losingBids) {
        const losingUser = await User.findByPk(bid.userId);
        const amountDecimal = new Decimal(bid.amount);
        losingUser.balance = new Decimal(losingUser.balance);

        losingUser.balance = losingUser.balance.add(amountDecimal);
        await losingUser.save();
      }

      res.send({ id: session.id });
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
}

module.exports = new PaymentController();
