const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  turf: {
     type: mongoose.Schema.Types.ObjectId,
      ref: "turf",
       required: [true,"turf is required"]
     },
  user: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: "user",
      required: true
     },
  rating: {
     type: Number,
      min: 1, 
      max: 5,
      required: [true,"rqting is required"]
     },
  comment: { 
    type: String,
    trim: true,
    minlength:[10,"feedback must be atleast 10 characters"],
    maxlength:[500,"feedback must not exceed 500 characters"]
 }
}, { timestamps: true });

const ReviewModel = mongoose.model("review", reviewSchema);
module.exports = ReviewModel;
