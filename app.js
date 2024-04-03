require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const db = require("./db");

const app = express();

app.use(bodyParser.json());

const dbConnection = async () => {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");
    app.listen(process.env.PORT || 5001, () => {
      console.log("Server is running!");
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

dbConnection();
