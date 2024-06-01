const Router = require("express");
const router = new Router();

const watchlistController = require("../controllers/watch-list-controller");
const checkAuth = require("../middleware/check-auth");

router.post("/add", checkAuth, watchlistController.addToWatchlist);
router.get("/:userId", checkAuth, watchlistController.getWatchlist);
router.get("/:id/check-exist", checkAuth, watchlistController.checkWatchlist);

module.exports = router;
