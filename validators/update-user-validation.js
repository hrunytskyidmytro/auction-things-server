const { check } = require("express-validator");

exports.validateUpdateUser = [
  check("firstName")
    .exists()
    .withMessage("Ім'я є обов'язковим полем")
    .isLength({ min: 2, max: 32 })
    .withMessage(
      "Ім'я повинно містити не менше 2 символів та не перевищувати 32 символи"
    ),
  check("lastName")
    .exists()
    .withMessage("Прізвище є обов'язковим полем")
    .isLength({ min: 2, max: 32 })
    .withMessage(
      "Прізвище повинно містити не менше 2 символів та не перевищувати 32 символи"
    ),
  check("patronymic")
    .optional()
    .isLength({ min: 2 })
    .withMessage("По-батькові повинно містити не менше 2 символів"),
  check("email")
    .exists()
    .withMessage("Email є обов'язковим полем")
    .isEmail()
    .withMessage("Неправильний email"),
];
