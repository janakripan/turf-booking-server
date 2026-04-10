const mongoose = require("mongoose");

const turfSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    location: {
      type: String,
      required: [true, "Location is required"],
    },

    pricePerHour: {
      type: Number,
      required: [true, "Price per hour is required"],
    },

    amenities: [{ type: String }],
    imageUrls: [{ type: String }],

    // admin (single user who owns the turf)
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Gym admin is required"],
      ref: "user",
    },

    // managers (multiple allowed)
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    // availability (required fields for each slot)
    availability: [
      {
        day: { type: String, required: [true, "Day is required"] }, // e.g. "Monday"
        open: { type: String, required: [true, "Opening time is required"] }, // e.g. "08:00"
        close: { type: String, required: [true, "Closing time is required"] }, // e.g. "22:00"
      },
    ],
  },
  { timestamps: true }
);

const TurfModel = mongoose.model("turf", turfSchema);
module.exports = TurfModel;
