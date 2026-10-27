const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/users.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/majorproject";

async function initDB() {
    await mongoose.connect(MONGO_URL);

    const owner = await User.findOne().select("_id");
    if (!owner) {
        throw new Error("Create a user account before initializing listing data.");
    }

    const operations = initData.data.map((listing) => ({
        updateOne: {
            filter: { title: listing.title },
            update: { $set: { ...listing, owner: owner._id } },
            upsert: true,
        },
    }));

    await Listing.bulkWrite(operations);
    console.log("Listing data initialized with owner references.");
}

initDB()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
