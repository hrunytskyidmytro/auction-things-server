const Router = require("express");
const router = new Router();

const categoryController = require("../controllers/category-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");

const { validateCategory } = require("../validators/category-validation");
const validationErrorHandler = require("../middleware/validation-error-handler");

router.post(
  "/",
  checkAuth,
  checkRole("ADMIN"),
  validateCategory,
  validationErrorHandler,
  categoryController.createCategory
);

router.get("/", categoryController.getAllCategories);

module.exports = router;
