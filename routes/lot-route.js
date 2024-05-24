const Router = require("express");
const router = new Router();

const lotController = require("../controllers/lot-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");

const { validateSignUp } = require("../validators/sign-up-validation");
const validationErrorHandler = require("../middleware/validation-error-handler");

router.post("/", checkAuth, checkRole("SELLER"), lotController.createLot);
router.put(
  "/:id",
  checkAuth,
  checkRole(["ADMIN", "SELLER"]),
  lotController.updateLot
);
router.delete("/:id", checkAuth, checkRole("ADMIN"), lotController.deleteLot);
router.put("/:id/open", checkAuth, checkRole("SELLER"), lotController.openLot);
router.put(
  "/:id/close",
  checkAuth,
  checkRole("SELLER"),
  lotController.closeLot
);

module.exports = router;
