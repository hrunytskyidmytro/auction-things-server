const { validationResult } = require("express-validator");

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Помилка валідації.", errors: errors.array() });
  }
  next();
};

module.exports = validationErrorHandler;
