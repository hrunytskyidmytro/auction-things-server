const Router = require("express");
const router = new Router();

const statisticsController = require("../controllers/statistics-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");
const { USER_ROLES } = require("../constants/role-constants");

router.get(
  "/",
  checkAuth,
  checkRole(USER_ROLES.admin),
  statisticsController.getStatistics
);

module.exports = router;
