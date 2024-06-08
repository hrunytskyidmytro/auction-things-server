const { User } = require("../models");
const emailService = require("../services/email-service");

class LotService {
  async closeLot(lot) {
    if (
      lot.status === "CLOSED" ||
      new Date(lot.endDate).getTime() > new Date().getTime()
    ) {
      return;
    }

    lot.status = "CLOSED";

    if (lot.currentPrice < lot.reservePrice) {
      await lot.save();
      return;
    }

    const bids = lot.Bids;
    if (bids.length > 0) {
      const highestBid = bids.reduce(
        (max, bid) => (bid.amount > max.amount ? bid : max),
        bids[0]
      );
      lot.winnerId = highestBid.userId;
    }

    await lot.save();

    if (lot.winnerId) {
      const winner = await User.findByPk(lot.winnerId);
      await emailService.sendEmail(
        winner.email,
        "Вітаємо!",
        `Ви виграли лот: ${lot.title}. Перейдіть за посиланням для оформлення замовлення: http://localhost:3000/payment?lotId=${lot.id}.`
      );
    }

    const losingBids = bids.filter((bid) => bid.userId !== lot.winnerId);
    const userEmails = losingBids.map((bid) => bid.User.email);
    if (userEmails.length) {
      await emailService.sendEmail(
        userEmails,
        "Дякуємо за участь.",
        `На жаль, ви не виграли лот: ${lot.title}. Ми цінуємо Вашу участь і сподіваємося, що Ви знайдете щось цікаве в наших наступних лотах.`
      );
    }
  }

  async closeLotArray(lots) {
    for (const lot of lots) {
      await this.closeLot(lot);
    }
  }
}

module.exports = new LotService();
