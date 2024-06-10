const Router = require("express");
const router = new Router();

const auctionHistoryController = require("../controllers/auction-history-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");

const { USER_ROLES } = require("../constants/role-constants");

router.get(
  "/",
  checkAuth,
  checkRole(USER_ROLES.admin),
  auctionHistoryController.getAllAuctionHistories
);

router.delete(
  "/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  auctionHistoryController.deleteAuctionHistory
);

module.exports = router;
