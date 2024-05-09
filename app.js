require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const db = require("./db");

const googleAuthRoutes = require("./routes/google-auth-route");

const userRoutes = require("./routes/user-route");

const app = express();

app.use(bodyParser.json());

app.use("/api", googleAuthRoutes);

app.use("/api/user", userRoutes);

const dbConnection = async () => {
  try {
    await db.authenticate();
    await db.sync();
    console.log("Connection has been established successfully.");
    app.listen(process.env.PORT || 5001, () => {
      console.log("Server is running!");
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

dbConnection();
