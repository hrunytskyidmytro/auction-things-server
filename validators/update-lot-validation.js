const { check } = require("express-validator");

exports.validateUpdateLot = [
  check("title")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Назва лоту повинна містити не менше 2 символів та не перевищувати 100 символів."
    )
    .bail(),
  check("description")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Опис лоту повинний містити не менше 6 символів.")
    .bail(),
  check("startingPrice")
    .optional()
    .isDecimal({ gt: 0 })
    .withMessage("Початкова ціна повинна бути позитивним числом."),
  check("endDate")
    .optional()
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
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Невірна категорія. Будь ласка, виберіть іншу категорію."),
  check("buyNowPrice")
    .optional()
    .isDecimal({ gt: 0 })
    .withMessage("Ціна купівлі зараз повинна бути позитивним числом.")
    .custom((value, { req }) => {
      if (req.body.startingPrice) {
        const buyNowPrice = parseFloat(value);
        const startingPrice = parseFloat(req.body.startingPrice);

        if (buyNowPrice <= startingPrice) {
          throw new Error(
            "Ціна купівлі зараз повинна бути більшою за початкову ціну."
          );
        }
      }
      return true;
    }),
  check("bidIncrement")
    .optional()
    .isDecimal({ gt: 0 })
    .withMessage("Крок ставки повинен бути позитивним числом.")
    .custom((value, { req }) => {
      if (req.body.startingPrice) {
        const bidIncrement = parseFloat(value);
        const startingPrice = parseFloat(req.body.startingPrice);

        if (bidIncrement > startingPrice) {
          throw new Error(
            "Крок ставки не повинен перевищувати початкову ціну."
          );
        }
      }
      return true;
    }),
  check("reservePrice")
    .optional()
    .isDecimal({ gt: 0 })
    .withMessage("Резервна ціна повинна бути позитивним числом.")
    .custom((value, { req }) => {
      if (req.body.startingPrice) {
        const reservePrice = parseFloat(value);
        const startingPrice = parseFloat(req.body.startingPrice);

        if (reservePrice < startingPrice) {
          throw new Error(
            "Резервна ціна повинна бути більшою або дорівнювати початковій ціні."
          );
        }
      }
      return true;
    }),
];
