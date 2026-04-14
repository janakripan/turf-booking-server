const express = require("express");
const router = express.Router();
const {
  getManagerBookingsController,
  updateBookingStatusController,
  banUserController,
  unbanUserController,
} = require("../controllers/managerController");
const {
  managerOnlyMiddleware,
} = require("../middlewares/authenticationMiddleware");

// All routes here require manager/admin roles
router.use(managerOnlyMiddleware);

router.get("/bookings", getManagerBookingsController);
router.patch("/booking/status", updateBookingStatusController);
router.post("/ban", banUserController);
router.post("/unban", unbanUserController);

module.exports = router;
