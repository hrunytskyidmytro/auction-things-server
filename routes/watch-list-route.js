const Router = require("express");
const router = new Router();

const watchlistController = require("../controllers/watch-list-controller");
const checkAuth = require("../middleware/check-auth");

router.get("/:userId", checkAuth, watchlistController.getWatchlistByUserId);
router.post("/add", checkAuth, watchlistController.addToWatchlist);
router.delete("/delete", checkAuth, watchlistController.deleteFromWatchlist);
router.get("/:id/check-exist", checkAuth, watchlistController.checkWatchlist);

module.exports = router;
