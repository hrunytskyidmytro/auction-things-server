const { Order, Lot, User } = require("../models");
const HttpError = require("../errors/http-error");

class OrderController {
  async getAllOrders(req, res, next) {
    try {
      const orders = await Order.findAll({
        include: [
          {
            model: Lot,
            as: "lot",
            attributes: ["id", "title"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      });

      res.json(orders);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати замовлення. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async getOrderById(req, res, next) {
    const orderId = req.params.id;

    try {
      const order = await Order.findByPk(orderId);

      if (!order) {
        return next(HttpError.notFound("Замовлення не знайдено."));
      }

      res.status(200).json(order);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати замовлення. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async deleteOrder(req, res, next) {
    const orderId = req.params.id;

    try {
      const order = await Order.findByPk(orderId);

      if (!order) {
        return next(HttpError.notFound("Замовлення не знайдено."));
      }

      await order.destroy();
      res.json({ message: "Замовлення успішно видалено." });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося видалити замовлення. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async updateOrderStatus(req, res, next) {
    const orderId = req.params.id;
    const { status } = req.body;

    try {
      const order = await Order.findByPk(orderId);

      if (!order) {
        return next(HttpError.notFound("Замовлення не знайдено."));
      }

      order.status = status;
      await order.save();

      res.status(200).json({ message: "Статус замовлення оновлено.", order });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося оновити статус замовлення. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }
}

module.exports = new OrderController();
