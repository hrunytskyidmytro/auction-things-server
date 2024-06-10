const Router = require("express");
const router = new Router();

const paymentController = require("../controllers/payment-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");
const { USER_ROLES } = require("../constants/role-constants");

router.post(
  "/create-checkout-session",
  checkAuth,
  paymentController.createCheckoutSession
);

router.post("/confirm-purchase", checkAuth, paymentController.confirmPurchase);

router.post("/add-funds", checkAuth, paymentController.addFunds);

router.post("/withdraw-funds", checkAuth, paymentController.withdrawFunds);

router.get("/", checkAuth, paymentController.getAllPayments);

router.delete(
  "/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  paymentController.deletePayment
);

module.exports = router;
