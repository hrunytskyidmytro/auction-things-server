const { check } = require("express-validator");

exports.validateSignUp = [
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
  check("password")
    .exists()
    .withMessage("Пароль є обов'язковим полем")
    .isLength({ min: 8 })
    .withMessage("Пароль повинен містити не менше 8 символів")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*()]{8,}$/
    )
    .withMessage(
      "Пароль повинен містити принаймні одну велику літеру, одну маленьку літеру, одну цифру і один спеціальний символ"
    ),
  check("confirmPassword")
    .exists()
    .withMessage("Підтвердження пароля є обов'язковим полем")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Паролі не співпадають");
      }
      return true;
    }),
  check("role")
    .exists()
    .withMessage("Роль є обов'язковим полем")
    .isIn(["BUYER", "SELLER"])
    .withMessage("Невірна роль"),
  check("companyName")
    .if((value, { req }) => req.body.role === "SELLER")
    .exists()
    .withMessage("Назва компанії є обов'язковим полем")
    .isLength({ min: 2 })
    .withMessage("Назва компанії повинна містити не менше 2 символів"),
  check("companySite")
    .if((value, { req }) => req.body.role === "SELLER")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Неправильний сайт компанії"),
  check("position")
    .if((value, { req }) => req.body.role === "SELLER")
    .exists()
    .withMessage("Посада є обов'язковим полем")
    .isLength({ min: 2 })
    .withMessage("Посада повинна містити не менше 2 символів"),
  check("companyName")
    .if((value, { req }) => req.body.role === "BUYER")
    .custom((value, { req }) => {
      if (value) {
        throw new Error("Поле companyName не може бути заповнене покупцем");
      }
      return true;
    }),
  check("companySite")
    .if((value, { req }) => req.body.role === "BUYER")
    .custom((value, { req }) => {
      if (value) {
        throw new Error("Поле companySite не може бути заповнене покупцем");
      }
      return true;
    }),
  check("position")
    .if((value, { req }) => req.body.role === "BUYER")
    .custom((value, { req }) => {
      if (value) {
        throw new Error("Поле position не може бути заповнене покупцем");
      }
      return true;
    }),
];
