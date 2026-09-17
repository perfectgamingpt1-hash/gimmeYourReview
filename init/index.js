const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../Models/Listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("CONNECTED TO DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6aa2ba7180a1cb4b9d985fb7",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
