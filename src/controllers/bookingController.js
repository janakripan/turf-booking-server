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

    if (turf.bannedUsers && turf.bannedUsers.includes(userId)) {
      return res.status(403).json({ message: "You are banned from booking this turf." });
    }

    // 1. Availability Check (Day of week)
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const dayAvailability = turf.availability?.find(
        (a) => a.day?.trim().toLowerCase() === dayOfWeek.toLowerCase()
      );

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
    } else if (err.name === "CastError") {
      res.status(400).json({ message: "Invalid Turf ID format" });
    } else {
      console.error("Booking Error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
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

const getAvailableSlotsController = async (req, res) => {
  try {
    const { turfId } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const bookings = await BookingModel.find({
      turf: turfId,
      date: new Date(date),
      status: { $in: ["pending", "confirmed"] },
    }).select("startTime endTime");

    res.status(200).json({ message: "Fetched bookings for date", bookings });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

const getAdminTurfBookingsController = async (req, res) => {
  try {
    // Find all turfs owned by this admin
    const adminTurfs = await TurfModel.find({ admin: req.user._id }).select("_id");
    const turfIds = adminTurfs.map((t) => t._id);

    const bookings = await BookingModel.find({ turf: { $in: turfIds } })
      .populate("user", "userName email contactNo")
      .populate("turf", "name location")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ message: "Fetched admin turf bookings", bookings });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

module.exports = {
  createBookingController,
  getUserBookingsController,
  getAvailableSlotsController,
  getAdminTurfBookingsController,
};
