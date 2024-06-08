const { User, Payment, Order } = require("../models");
const emailService = require("../services/email-service");
const Decimal = require("decimal.js");

class PaymentService {
  async confirmPayment(lot, user, price) {
    const existingOrder = await Order.findOne({
      where: {
        userId: user.id,
        lotId: lot.id,
      },
    });

    if (existingOrder) {
      console.log("Замовлення вже існує. Повторне підтвердження неможливе.");
      return;
    }

    if (lot.status !== "CLOSED") {
      lot.status = "CLOSED";
      lot.winnerId = user.id;
      lot.endDate = new Date();
      await lot.save();
    }

    const bidsWinnerUser = await lot.getBids();
    const userBids = bidsWinnerUser.filter((bid) => bid.userId === user.id);
    if (userBids.length > 0) {
      for (const bid of userBids) {
        const winnerUser = await User.findByPk(bid.userId);
        const amountDecimal = new Decimal(bid.amount);
        winnerUser.balance = new Decimal(winnerUser.balance);

        winnerUser.balance = winnerUser.balance.add(amountDecimal);
        await winnerUser.save();
      }
    }

    price = new Decimal(price);
    const commission = price.times(0.05);
    const amountToSeller = price.minus(commission);

    const seller = await User.findByPk(lot.userId);
    seller.balance = new Decimal(seller.balance);
    seller.balance = seller.balance.add(amountToSeller);
    await seller.save();

    const bids = await lot.getBids();
    const losingBids = bids.filter((bid) => bid.userId !== user.id);
    for (const bid of losingBids) {
      const losingUser = await User.findByPk(bid.userId);
      const amountDecimal = new Decimal(bid.amount);
      losingUser.balance = new Decimal(losingUser.balance);

      losingUser.balance = losingUser.balance.add(amountDecimal);
      await losingUser.save();
    }

    await Payment.create({
      amount: price,
      userId: user.id,
      lotId: lot.id,
      status: "COMPLETED",
      type: "SALE",
      commission: commission,
    });

    const order = await Order.create({
      userId: user.id,
      lotId: lot.id,
      amount: price,
      status: "PROCESSING",
    });

    await emailService.sendEmail(
      user.email,
      "Дякуємо за покупку!",
      `Номер вашого замовлення #${order.id}. З цього моменту воно буде готуватися до відправки. Ми Вас повідомимо, як тільки його відправимо. Дякуємо за довіру!`
    );
  }
}

module.exports = new PaymentService();
