const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const BookingModel = require('../models/bookingModel');
const TurfModel = require('../models/turfModel');

const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await BookingModel.findById(bookingId).populate('turf');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking for ${booking.turf.name}`,
              description: `Date: ${booking.date.toDateString()}, Time: ${booking.startTime} - ${booking.endTime}`,
            },
            unit_amount: booking.totalAmount * 100, // Stripe expects amounts in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/cancel`,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe Session Error:', err);
    res.status(500).json({ message: 'Error creating payment session', error: err.message });
  }
};

const verifyPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const bookingId = session.metadata.bookingId;
      await BookingModel.findByIdAndUpdate(bookingId, { 
        paymentStatus: 'paid',
        status: 'confirmed'
      });
      res.status(200).json({ message: 'Payment verified successfully', status: 'paid' });
    } else {
      res.status(200).json({ message: 'Payment not completed', status: session.payment_status });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error verifying payment', error: err.message });
  }
};

module.exports = { createCheckoutSession, verifyPaymentStatus };
