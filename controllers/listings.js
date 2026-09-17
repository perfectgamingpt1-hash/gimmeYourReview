const Listing = require("../Models/Listing");

module.exports.index = async (req, res) => {
  const { category, search } = req.query;

  let filter = {};
  if (category) {
    filter.categories = category;
  }

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }
  const allListings = await Listing.find(filter);

  res.render("listings/index", {
    allListings,
    activeCategory: category || "",
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you are trying to get does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

module.exports.createRoute = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  const userLocation = req.body.listing.location;
  const category = req.body.listing.category;
  newListing.owner = req.user._id;

  const targetUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(userLocation)}&format=json&limit=1`;
  console.log(targetUrl);
  const response = await fetch(targetUrl, {
    headers: { "User-Agent": "MyListingApp/1.0" },
  });
  const data = await response.json();

  if (data && data.length > 0) {
    lat = parseFloat(data[0].lat);
    lon = parseFloat(data[0].lon);

    console.log(`Successfully geocoded location to: [${lat}, ${lon}]`);
  } else {
    console.log(
      `Geocoding failed for: "${userLocation}". Using default fallback.`,
    );
  }

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { filename, url };
  } else if (
    req.body.listing &&
    req.body.listing.image &&
    req.body.listing.image.url
  ) {
    let url = req.body.listing.image.url;
    let filename = "linklistingimage";
    newListing.image = { filename, url };
  } else {
    newListing.image = undefined;
  }

  newListing.geometry = {
    type: "Point",
    coordinates: [lon, lat],
  };

  newListing.categories = category;

  await newListing.save();
  req.flash("success", "New listing Created:");
  return res.redirect("/listings");
};

module.exports.editRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("owner");

  let orgUrl = listing.image.url;
  orgImg = orgUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit", { listing, orgImg });
};

module.exports.updateRoute = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  const category = req.body.listing.category;

  listing.categories = category;

  const userLocation = req.body.listing.location;

  const targetUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(userLocation)}&format=json&limit=1`;
  console.log(targetUrl);
  const response = await fetch(targetUrl, {
    headers: { "User-Agent": "MyListingApp/1.0" },
  });
  const data = await response.json();

  if (data && data.length > 0) {
    lat = parseFloat(data[0].lat);
    lon = parseFloat(data[0].lon);

    listing.geometry = {
      type: "Point",
      coordinates: [lon, lat],
    };

    console.log(`Successfully geocoded location to: [${lat}, ${lon}]`);
  } else {
    console.log(
      `Geocoding failed for: "${userLocation}". Using default fallback.`,
    );
  }

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { filename, url };
  } else if (
    req.body.listing &&
    req.body.listing.image &&
    req.body.listing.image.url
  ) {
    let url = req.body.listing.image.url;
    let filename = "linklistingimage";
    listing.image = { filename, url };
  }

  await listing.save();

  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteRoute = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  console.log("Deleted");
  req.flash("success", "listing Deleted:");
  res.redirect("/listings");
};
