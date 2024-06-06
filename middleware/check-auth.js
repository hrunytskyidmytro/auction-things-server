const jwt = require("jsonwebtoken");

const HttpError = require("../errors/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      throw new Error(
        "Не вдалося пройти автентифікацію: Відсутній заголовок авторизації!"
      );
    }
    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      throw new Error("Помилка автентифікації!");
    }
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    if (!decodedToken) {
      throw new Error(
        "Не вдалося пройти автентифікацію: Декодований токен порожній!"
      );
    }
    req.userData = { userId: decodedToken.userId, role: decodedToken.role };
    next();
  } catch (err) {
    const error = HttpError.unauthorized(
      "Помилка автентифікації! Будь ласка, авторизуйтесь."
    );
    return next(error);
  }
};
