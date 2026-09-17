const Listing = require("./Models/Listing");
const { listingSchema, reviewSchema } = require("./schema.js");
const expressError = require("./utils/expressError.js");
const Review = require("./Models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in first to create a listings!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const ownerId = listing.owner?._id?.toString() || listing.owner?.toString();
  const currentUserId = res.locals.currUser?._id?.toString();

  if (ownerId !== currentUserId) {
    req.flash(
      "error",
      "I got you motherfuker, trying to trespass. [Nice try!,TRY AGAIN!!]",
    );
    return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new expressError(400, error);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new expressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewsID } = req.params;
  let review = await Review.findById(reviewsID);
  if (!review?.author?.equals(res.locals.currUser?._id)) {
    req.flash(
      "error",
      "I got you motherfuker, trying to trespass. [Nice try!,TRY AGAIN!!]",
    );
    return res.redirect(`/listings/${id}`);
  }
  next();
};
