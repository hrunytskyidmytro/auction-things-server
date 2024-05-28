const Router = require("express");
const router = new Router();

const bidController = require("../controllers/bid-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");

const { validateLot } = require("../validators/lot-validation");
const validationErrorHandler = require("../middleware/validation-error-handler");

const { USER_ROLES } = require("../constants/role-constants");

router.post("/:id", checkAuth, bidController.createBid);

router.get("/", checkAuth, bidController.getAllBids);

router.delete(
  "/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  bidController.deleteBid
);

module.exports = router;
