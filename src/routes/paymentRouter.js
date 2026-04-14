const express = require('express');
const router = express.Router();
const { createCheckoutSession, verifyPaymentStatus } = require('../controllers/paymentController');
const { getUserMiddleware } = require('../middlewares/authenticationMiddleware');

// All payment routes require authentication
router.post('/create-checkout-session', createCheckoutSession);
router.get('/verify-payment', verifyPaymentStatus);

module.exports = router;
