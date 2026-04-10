const ReviewModel = require("../models/reviewModel");
const BookingModel = require("../models/bookingModel");
const { getValidationErrorMessage } = require("../utils/validationUtils");

const createReviewController = async (req, res) => {
  try {
    const { turfId, rating, comment } = req.body;
    const userId = req.user._id;

    // Check if user has a completed booking for this turf (optional but recommended)
    const hasBooking = await BookingModel.findOne({
      user: userId,
      turf: turfId,
      status: "confirmed", // Or "attended" if we add that status
    });

    if (!hasBooking) {
      return res.status(403).json({
        message: "You can only review turfs you have successfully booked.",
      });
    }

    const review = await ReviewModel.create({
      turf: turfId,
      user: userId,
      rating,
      comment,
    });

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = getValidationErrorMessage(err);
      res.status(400).json({ message });
    } else {
      res.status(500).json({ message: "Server error", err });
    }
  }
};

const getTurfReviewsController = async (req, res) => {
  try {
    const { turfId } = req.params;
    const reviews = await ReviewModel.find({ turf: turfId })
      .populate("user", "userName imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Reviews fetched successfully", reviews });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

module.exports = { createReviewController, getTurfReviewsController };
