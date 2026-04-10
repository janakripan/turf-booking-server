const express = require("express");
const router = express.Router();
const {
  createBookingController,
  getUserBookingsController,
} = require("../controllers/bookingController");
const {
  getUserMiddleware,
} = require("../middlewares/authenticationMiddleware");

// All booking routes require authentication
router.post("/", createBookingController);
router.get("/my-bookings", getUserBookingsController);

module.exports = router;
