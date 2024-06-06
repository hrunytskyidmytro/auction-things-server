const Router = require("express");
const router = new Router();

const categoryController = require("../controllers/category-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");

const { validateCategory } = require("../validators/category-validation");
const validationErrorHandler = require("../middleware/validation-error-handler");

const { USER_ROLES } = require("../constants/role-constants");

router.get(
  "/",
  // checkAuth,
  // checkRole(USER_ROLES.admin),
  categoryController.getAllCategories
);

router.get("/:id/lots", categoryController.getLotsByCategory);

router.post(
  "/",
  checkAuth,
  checkRole(USER_ROLES.admin),
  validateCategory,
  validationErrorHandler,
  categoryController.createCategory
);

router.delete(
  "/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  categoryController.deleteCategory
);

module.exports = router;
