const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../Models/Listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../CloudConfig.js");
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router
  .route("/")
  // Index route // home
  .get(wrapAsync(listingController.index))
  // Create route
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createRoute),
  );

// New listings
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  // Show route
  .get(wrapAsync(listingController.showRoute))
  // Update route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.updateRoute),
  )
  // delete route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteRoute));

// edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editRoute),
);

module.exports = router;
