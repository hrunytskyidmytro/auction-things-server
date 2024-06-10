const Router = require("express");
const router = new Router();

const userController = require("../controllers/user-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");

const { validateSignUp } = require("../validators/sign-up-validation");
const { validateUpdateUser } = require("../validators/update-user-validation");
const validationErrorHandler = require("../middleware/validation-error-handler");

const { USER_ROLES } = require("../constants/role-constants");

router.get("/current-user", checkAuth, userController.getCurrentUserInfo);

router.get(
  "/",
  checkAuth,
  checkRole(USER_ROLES.admin),
  userController.getAllUsers
);

router.post(
  "/signup",
  validateSignUp,
  validationErrorHandler,
  userController.signUp
);

router.get(
  "/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  userController.getUserById
);

router.patch(
  "/:id",
  checkAuth,
  validateUpdateUser,
  validationErrorHandler,
  userController.updateUser
);

router.delete(
  "/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  userController.deleteUser
);

router.patch(
  "/block/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  userController.blockUser
);

router.patch(
  "/unblock/:id",
  checkAuth,
  checkRole(USER_ROLES.admin),
  userController.unblockUser
);

router.post("/login", userController.logIn);

router.post("/check-pin-code", userController.checkPinCode);

router.post("/resend-pin-code", userController.resendPinCode);

module.exports = router;
