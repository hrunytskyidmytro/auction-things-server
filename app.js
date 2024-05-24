require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const db = require("./db");

const HttpError = require("./errors/http-error");

const googleAuthRoutes = require("./routes/google-auth-route");
const userRoutes = require("./routes/user-route");
const passwordResetRoutes = require("./routes/password-reset-route");

const lotRoutes = require("./routes/lot-route");

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use("/api", googleAuthRoutes);

app.use("/api/user", userRoutes);

app.use("/api/password", passwordResetRoutes);

app.use("/api/lots", lotRoutes);

app.use((req, res, next) => {
  const error = HttpError.notFound("Не вдалося знайти маршрут.");
  throw error;
});

app.use((error, req, res, next) => {
  res.status(error.code || 500);
  res.json({ message: error.message || "Виникла невідома помилка!" });
});

const dbConnection = async () => {
  try {
    await db.authenticate();
    await db.sync();
    console.log("Підключення до БД успішно встановлено.");
    app.listen(process.env.PORT || 5001, () => {
      console.log("Сервер запущено!");
    });
  } catch (error) {
    console.error("Неможливо підключитися до бази даних:", error);
  }
};

dbConnection();
