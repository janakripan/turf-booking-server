const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "booking", 
    required: [true,"booking is required"] 
},
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "user", 
    required: [true,"user is required"] 
},
  amount: { 
    type: Number, 
    required: [true,"amount is required"] 
},
  provider: { 
    type: String, 
    enum: ["stripe", "razorpay"], 
    required: [true,"provider is required"] 
},
  transactionId: { 
    type: String, 
    required: [true,"transaction id is required"] 
},
  status: { 
    type: String, 
    enum: ["success", "failed", "pending"], 
    default: "pending" 
}
}, { timestamps: true });

const PaymentModel = mongoose.model("Payment", paymentSchema);
module.exports = PaymentModel;
