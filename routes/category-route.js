const Router = require("express");
const router = new Router();

const categoryController = require("../controllers/category-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");
const fileUpload = require("../middleware/file-upload");

const { validateCategory } = require("../validators/category-validation");
const validationErrorHandler = require("../middleware/validation-error-handler");
const { USER_ROLES } = require("../constants/role-constants");

router.get("/", categoryController.getAllCategories);

router.get("/:id/lots", categoryController.getLotsByCategory);

router.get(
  "/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  categoryController.getCategoryById
);

router.post(
  "/",
  fileUpload.single("image"),
  checkAuth,
  checkRole(USER_ROLES.admin),
  validateCategory,
  validationErrorHandler,
  categoryController.createCategory
);

router.patch(
  "/:id",
  checkAuth,
  validateCategory,
  validationErrorHandler,
  categoryController.updateCategory
);

router.delete(
  "/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  categoryController.deleteCategory
);

module.exports = router;
