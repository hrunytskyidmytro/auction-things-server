const Router = require("express");
const router = new Router();

const userController = require("../controllers/user-controller");

router.post("/signup", userController.signup);

router.post("/login", userController.login);

module.exports = router;
