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
        `Ви виграли лот: ${lot.title}`
      );
    }

    const losingBids = bids.filter((bid) => bid.userId !== lot.winnerId);
    const userEmails = losingBids.map((bid) => bid.User.email);
    if (userEmails.length) {
      await emailService.sendEmail(
        userEmails,
        "Дякуємо за участь.",
        `Ви не виграли лот: ${lot.title}`
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
