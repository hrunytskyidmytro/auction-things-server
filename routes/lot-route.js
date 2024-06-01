const Router = require("express");
const router = new Router();

const lotController = require("../controllers/lot-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");
const fileUpload = require("../middleware/file-upload");

const { validateLot } = require("../validators/lot-validation");
const validationErrorHandler = require("../middleware/validation-error-handler");

const { USER_ROLES } = require("../constants/role-constants");

router.get("/", lotController.getAllLots);

router.get("/:id", lotController.getLotById);

router.get("/:id/bids", lotController.getLotBids);

router.post(
  "/",
  fileUpload.array("images", 5),
  checkAuth,
  checkRole([USER_ROLES.admin, USER_ROLES.seller]),
  validateLot,
  validationErrorHandler,
  lotController.createLot
);

router.patch(
  "/:id",
  fileUpload.array("images", 5),
  checkAuth,
  checkRole([USER_ROLES.admin, USER_ROLES.seller]),
  validateLot,
  validationErrorHandler,
  lotController.updateLot
);

router.delete(
  "/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  lotController.deleteLot
);

router.patch(
  "/:id/open",
  checkAuth,
  checkRole([USER_ROLES.admin, USER_ROLES.seller]),
  lotController.openLot
);

router.get("/:id/history", lotController.getLotHistory);

module.exports = router;
