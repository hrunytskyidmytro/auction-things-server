const { check } = require("express-validator");

exports.validateCategory = [
  check("name")
    .exists()
    .withMessage("Назва категорії є обов'язковим полем.")
    .isLength({ min: 2, max: 30 })
    .withMessage(
      "Назва категорії повинна містити не менше 2 символів та не перевищувати 30 символів."
    )
    .bail(),
  check("description")
    .exists()
    .withMessage("Опис є обов'язковим полем.")
    .isLength({ min: 6, max: 1000 })
    .withMessage(
      "Опис лоту повинний містити не менше 6 символів та не перевищувати 1000 символів."
    )
    .bail(),
];
