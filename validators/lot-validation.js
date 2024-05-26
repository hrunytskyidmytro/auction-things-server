const { check } = require("express-validator");

exports.validateLot = [
  check("title")
    .exists()
    .withMessage("Назва лоту є обов'язковим полем.")
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Назва лоту повинна містити не менше 2 символів та не перевищувати 100 символів."
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
  check("startingPrice")
    .exists()
    .withMessage("Початкова ціна є обов'язковим полем.")
    .isDecimal({ gt: 0 })
    .withMessage("Початкова ціна повинна бути позитивним числом."),
  check("endDate")
    .exists()
    .withMessage("Дата закриття лоту є обов'язковим полем.")
    .isISO8601()
    .withMessage("Невірний формат дати закінчення.")
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const currentDate = new Date();

      if (endDate <= currentDate) {
        throw new Error("Дата закінчення повинна бути у майбутньому.");
      }

      return true;
    }),
  check("categoryId")
    .exists()
    .withMessage("Обрання відповідної категорії є обов'язковим.")
    .isInt({ gt: 0 })
    .withMessage("Невірна категорія. Будь ласка, виберіть іншу категорію."),
  check("buyNowPrice")
    .optional()
    .isDecimal({ gt: 0 })
    .withMessage("Ціна купівлі зараз повинна бути позитивним числом.")
    .custom((value, { req }) => {
      const buyNowPrice = parseFloat(value);
      const startingPrice = parseFloat(req.body.startingPrice);

      if (buyNowPrice <= startingPrice) {
        throw new Error(
          "Ціна купівлі зараз повинна бути більшою за початкову ціну."
        );
      }

      return true;
    }),
  check("bidIncrement")
    .optional()
    .isDecimal({ gt: 0 })
    .withMessage("Крок ставки повинен бути позитивним числом.")
    .custom((value, { req }) => {
      const bidIncrement = parseFloat(value);
      const startingPrice = parseFloat(req.body.startingPrice);

      if (bidIncrement > startingPrice) {
        throw new Error("Крок ставки не повинен перевищувати початкову ціну.");
      }

      return true;
    }),
  check("reservePrice")
    .optional()
    .isDecimal({ gt: 0 })
    .withMessage("Резервна ціна повинна бути позитивним числом.")
    .custom((value, { req }) => {
      const reservePrice = parseFloat(value);
      const startingPrice = parseFloat(req.body.startingPrice);

      if (reservePrice < startingPrice) {
        throw new Error(
          "Резервна ціна повинна бути більшою або дорівнювати початковій ціні."
        );
      }

      return true;
    }),
];
