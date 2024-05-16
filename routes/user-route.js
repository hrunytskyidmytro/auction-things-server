const Router = require("express");
const router = new Router();

const userController = require("../controllers/user-controller");
const checkAuth = require("../middleware/check-auth");

router.post("/signup", userController.signUp);

router.post("/login", userController.logIn);

router.post("/check-pin-code", userController.checkPinCode);

router.post("/resend-pin-code", userController.resendPinCode);

router.get("/current-user", checkAuth, userController.getCurrentUserInfo);

module.exports = router;
