const dns = require("node:dns");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to DB");
}

async function geocodeListing(location, country) {
  const query = `${location || ""}, ${country || ""}`.trim();

  if (!query || !mapToken) {
    return { type: "Point", coordinates: [0, 0] };
  }

  const response = await geocodingClient
    .forwardGeocode({
      query,
      limit: 1,
    })
    .send();

  const feature = response.body?.features?.[0];
  if (!feature?.center) {
    return { type: "Point", coordinates: [0, 0] };
  }

  return { type: "Point", coordinates: feature.center }; 
}

const initDB = async () => {
  await main();
  await Listing.deleteMany({});

  const seedData = [];

  for (const obj of initData.data) {
    const geometry = await geocodeListing(obj.location, obj.country);
    seedData.push({
      ...obj,
      owner: "6a357461e77ec1097a08e5b4",
      geometry,
    });
  }

  await Listing.insertMany(seedData);
  console.log("Data was initialized with geocoded coordinates");
  await mongoose.disconnect();
};

initDB().catch((err) => {
  console.error(err);
  process.exit(1);
});