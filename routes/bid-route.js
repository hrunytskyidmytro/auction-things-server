const Router = require("express");
const router = new Router();

const bidController = require("../controllers/bid-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/check-role");

const { validateLot } = require("../validators/lot-validation");
const validationErrorHandler = require("../middleware/validation-error-handler");

router.post("/:id", checkAuth, bidController.createBid);

module.exports = router;
