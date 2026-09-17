const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");

const reviewsController = require("../controllers/reviews.js");

// post reviews route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewsController.postReviews),
);

// Delete reviews route
router.delete(
  "/:reviewsID",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewsController.deleteReviews),
);

module.exports = router;
