const Router = require("express");
const router = new Router();

const orderController = require("../controllers/order-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");

const { USER_ROLES } = require("../constants/role-constants");

router.get(
  "/",
  checkAuth,
  checkRole(USER_ROLES.admin),
  orderController.getAllOrders
);

router.patch(
  "/:id/status",
  checkAuth,
  checkRole(USER_ROLES.admin),
  orderController.updateOrderStatus
);

router.delete(
  "/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  orderController.deleteOrder
);

module.exports = router;
