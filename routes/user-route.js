const Router = require("express");
const router = new Router();

const userController = require("../controllers/user-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");

const { validateSignUp } = require("../validators/sign-up-validation");
const validationErrorHandler = require("../middleware/validation-error-handler");

const { USER_ROLES } = require("../constants/role-constants");

router.get(
  "/",
  checkAuth,
  checkRole(USER_ROLES.admin),
  userController.getAllUsers
);

router.delete(
  "/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  userController.deleteUser
);

router.post(
  "/signup",
  validateSignUp,
  validationErrorHandler,
  userController.signUp
);

router.post("/login", userController.logIn);

router.post("/check-pin-code", userController.checkPinCode);

router.post("/resend-pin-code", userController.resendPinCode);

router.get("/current-user", checkAuth, userController.getCurrentUserInfo);

module.exports = router;
