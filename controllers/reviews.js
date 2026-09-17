const Review = require("../Models/review.js");
const Listing = require("../Models/Listing.js");

module.exports.postReviews = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  req.flash("success", "Reviews Created");

  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReviews = async (req, res) => {
  let { id, reviewsID } = req.params;
  await Review.findByIdAndUpdate(id, { $pull: { reviews: reviewsID } });
  await Review.findByIdAndDelete(reviewsID);
  req.flash("success", "Reviews Deleted");

  res.redirect(`/listings/${id}`);
};
