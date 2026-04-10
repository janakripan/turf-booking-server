const express = require("express");
const router = express.Router();
const {
  createReviewController,
  getTurfReviewsController,
} = require("../controllers/reviewController");
const {
  getUserMiddleware,
} = require("../middlewares/authenticationMiddleware");

// Publicly view reviews
router.get("/:turfId", getTurfReviewsController);

// Submit a review (requires authentication)
router.post("/", createReviewController);

module.exports = router;
