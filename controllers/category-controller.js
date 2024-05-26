const { Category } = require("../models");
const HttpError = require("../errors/http-error");

class CategoryController {
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
}

module.exports = new CategoryController();
