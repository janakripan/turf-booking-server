const BookingModel = require("../models/bookingModel");
const TurfModel = require("../models/turfModel");
const { getValidationErrorMessage } = require("../utils/validationUtils");

const createBookingController = async (req, res) => {
  try {
    const { turfId, date, startTime, endTime } = req.body;
    const userId = req.user._id;

    if (!turfId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const turf = await TurfModel.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    // 1. Availability Check (Day of week)
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const dayAvailability = turf.availability.find((a) => a.day === dayOfWeek);

    if (!dayAvailability) {
      return res
        .status(400)
        .json({ message: `Turf is not available on ${dayOfWeek}` });
    }

    // 2. Time Range Check (Within open/close)
    if (
      startTime < dayAvailability.open ||
      endTime > dayAvailability.close ||
      startTime >= endTime
    ) {
      return res.status(400).json({
        message: `Invalid slot. Turf is open from ${dayAvailability.open} to ${dayAvailability.close}`,
      });
    }

    // 3. Collision Check (Overlap with existing bookings)
    const overlappingBooking = await BookingModel.findOne({
      turf: turfId,
      date: date,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } }, // starts during requested slot
        { endTime: { $gt: startTime, $lte: endTime } }, // ends during requested slot
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }, // requested slot is inside existing
      ],
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    // 4. Calculate total amount
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);
    const startMin = parseInt(startTime.split(":")[1]);
    const endMin = parseInt(endTime.split(":")[1]);

    const durationHours = endHour + endMin / 60 - (startHour + startMin / 60);
    const totalAmount = durationHours * turf.pricePerHour;

    const newBooking = await BookingModel.create({
      user: userId,
      turf: turfId,
      date,
      startTime,
      endTime,
      totalAmount,
      status: "pending",
      paymentStatus: "unpaid",
    });

    res
      .status(201)
      .json({ message: "Booking request created", booking: newBooking });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = getValidationErrorMessage(err);
      res.status(400).json({ message });
    } else {
      res.status(500).json({ message: "Server error", err });
    }
  }
};

const getUserBookingsController = async (req, res) => {
  try {
    const bookings = await BookingModel.find({ user: req.user._id })
      .populate("turf", "name location pricePerHour")
      .sort({ date: -1 });
    res
      .status(200)
      .json({ message: "Bookings fetched successfully", bookings });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

module.exports = { createBookingController, getUserBookingsController };
