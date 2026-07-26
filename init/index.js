const dns = require("node:dns");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    const seedData = initData.data.map((obj) => ({
        ...obj,
        owner: "6a357461e77ec1097a08e5b4",
        geometry: obj.geometry || { type: "Point", coordinates: [0, 0] },
    }));
    await Listing.insertMany(seedData);
    console.log("Data was initialized");
}

initDB();