const Router = require("express");
const router = new Router();

const paymentController = require("../controllers/payment-controller");
const checkAuth = require("../middleware/check-auth");

router.post(
  "/create-checkout-session",
  checkAuth,
  paymentController.createCheckoutSession
);

router.post("/add-funds", checkAuth, paymentController.addFunds);

router.post("/withdraw-funds", checkAuth, paymentController.withdrawFunds);

module.exports = router;
