const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const MONGO_URL="mongodb://127.0.0.1:27017/majorproject";



async function main(){
    await mongoose.connect(MONGO_URL);
    console.log("connected to db");

    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);

    console.log("data was initialised");
};

main()
.catch((err)=>{
    console.log(err);
});

