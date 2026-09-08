const { ref } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review")
const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        filename:String,
        url:{
        type:String,
        default:"https://images.pexels.com/photos/38788104/pexels-photo-38788104.jpeg",
        set:(v)=>v ===""? "https://images.pexels.com/photos/38788104/pexels-photo-38788104.jpeg":v,
    },
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
    ]
});

listingSchema.post("findOneAndDelete", async (listing)=>{
    if (listing){

    await Review.deleteMany({reviews:{$in:listing.reviews}})
    }
    });


const Listing= mongoose.model("Listing",listingSchema);
module.exports=Listing;
