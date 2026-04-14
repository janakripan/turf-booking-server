const express = require("express");
const router = express.Router();
const {
  createBookingController,
  getUserBookingsController,
  getAvailableSlotsController,
  getAdminTurfBookingsController,
} = require("../controllers/bookingController");
const {
  getUserMiddleware,
} = require("../middlewares/authenticationMiddleware");

// All booking routes require authentication
router.post("/", createBookingController);
router.get("/my-bookings", getUserBookingsController);
router.get("/available-slots/:turfId", getAvailableSlotsController);
router.get("/admin/all", getAdminTurfBookingsController);

module.exports = router;
