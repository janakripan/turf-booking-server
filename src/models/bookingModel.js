const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "user", 
    required: [true,"user is required"]
 },
  turf: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "turf", 
    required: [true,"turf is required "] 
},
  date: { 
    type: Date, 
    required: [true,"date is required"] 
},
  startTime: { 
    type: String, 
    required: [true,"start time is required"]
 },
  endTime: { 
    type: String, 
    required: [true,"end time is required"]
 },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "rescheduled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "failed"],
    default: "unpaid"
  },
  totalAmount: { 
    type: Number, 
    required: [true,"total amount is required"] 
}
}, { timestamps: true });

const BookingModel = mongoose.model("booking", bookingSchema);
module.exports = BookingModel;
