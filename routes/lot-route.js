const Router = require("express");
const router = new Router();

const lotController = require("../controllers/lot-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");
const fileUpload = require("../middleware/file-upload");

const { validateLot } = require("../validators/lot-validation");
const validationErrorHandler = require("../middleware/validation-error-handler");

router.post(
  "/",
  fileUpload.array("images", 5),
  checkAuth,
  checkRole(["ADMIN", "SELLER"]),
  validateLot,
  validationErrorHandler,
  lotController.createLot
);

router.patch(
  "/:id",
  checkAuth,
  checkRole(["ADMIN", "SELLER"]),
  validateLot,
  validationErrorHandler,
  lotController.updateLot
);

router.delete("/:id", checkAuth, checkRole("ADMIN"), lotController.deleteLot);

router.patch(
  "/:id/open",
  checkAuth,
  checkRole(["ADMIN", "SELLER"]),
  lotController.openLot
);

router.patch(
  "/:id/close",
  checkAuth,
  checkRole(["ADMIN", "SELLER"]),
  lotController.closeLot
);

router.get("/", lotController.getAllLots);

router.get("/:id/history", lotController.getLotHistory);

module.exports = router;
