const Router = require("express");
const router = new Router();

const googleAuthController = require("../controllers/google-auth-controller");

router.get("/auth/google", googleAuthController.auth);

router.get("/auth/google/callback", googleAuthController.callback);

module.exports = router;
