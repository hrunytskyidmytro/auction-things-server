const { Category, Lot, User, Bid } = require("../models");
const { Op } = require("sequelize");
const lotService = require("../services/lot-service");
const HttpError = require("../errors/http-error");

class CategoryController {
  async getAllCategories(req, res, next) {
    try {
      const categories = await Category.findAll();

      res.json(categories);
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося отримати категорії. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async getLotsByCategory(req, res, next) {
    const categoryId = req.params.id;

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

      let where = {
        categoryId,
      };

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
      console.log(error.message);
      next(
        HttpError.internalServerError(
          "Не вдалося отримати лоти для цієї категорії. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async createCategory(req, res, next) {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ where: { name } });

    if (existingCategory) {
      return next(
        HttpError.badRequest(
          "Категорія з такою назвою вже існує. Будь ласка, виберіть іншу назву."
        )
      );
    }

    try {
      const newCategory = await Category.create({ name, description });

      res.status(201).json({
        message: "Категорія успішно створено.",
        category: newCategory,
      });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося створити категорію. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }

  async deleteCategory(req, res, next) {
    const categoryId = req.params.id;

    try {
      const category = await Category.findByPk(categoryId);

      if (!category) {
        return next(HttpError.notFound("Категорії не знайдено."));
      }

      const linkedLots = await Lot.findAll({
        where: { categoryId: categoryId },
      });

      if (linkedLots.length > 0) {
        return next(
          HttpError.conflict(
            "Категорія не може бути видалена, оскільки вона використовується в лотах."
          )
        );
      }

      await category.destroy();
      res.json({ message: "Категорію успішно видалено." });
    } catch (error) {
      next(
        HttpError.internalServerError(
          "Не вдалося видалити категорію. Будь ласка, спробуйте пізніше."
        )
      );
    }
  }
}

module.exports = new CategoryController();
