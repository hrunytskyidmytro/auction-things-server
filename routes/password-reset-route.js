const Router = require("express");
const router = new Router();

const passwordResetController = require("../controllers/password-reset-controller");

router.post("/request-password-reset", passwordResetController.requestPasswordReset);

router.post("/reset-password", passwordResetController.resetPassword);

module.exports = router;
