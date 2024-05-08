const Router = require("express");
const router = new Router();

const userController = require("../controllers/user-controller");

router.post("/signup", userController.signUp);

router.post("/login", userController.logIn);

router.post("/check-pin-code", userController.checkPinCode);

router.post("/resend-pin-code", userController.resendPinCode);

module.exports = router;
