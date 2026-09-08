const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const ejsMate=require("ejs-mate");
const path=require("path");

const methodOverride=require("method-override")

const MONGO_URL="mongodb://127.0.0.1:27017/majorproject";

const wrapAsync=require("./utils/wrapAsync.js");

const ExpressError=require("./utils/ExpressError.js");

const {listingSchema,reviewSchema}=require("./schema.js");

const Review=require("./models/review.js");

const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");
const session=require("express-session");
const cookieParser=require("cookie-parser");
const flash = require("connect-flash/lib/flash.js");

main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:1000*60*60*24*3,
        httpOnly:true,
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.get("/",(req,res)=>{
    res.send("Hi ,im a root");
});

const validateListing=(req,res,next)=>{
 let {error}=listingSchema.validate(req.body);
    console.log("result");
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error);
    }else{
        next();
    }
    
}

const validateReview=(req,res,next)=>{
 let {error}=reviewSchema.validate(req.body);
    console.log("result");
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error);
    }else{
        next();
    }
    
}

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})

app.use("/listings",listings);

app.use("/listings/:id/reviews",reviews);

// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My new villa",
//         description:"By the Beach",
//         price:1200,
//         location:"Calangute,Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.all("/*splat",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));

});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong!"}= err;
    res.status(statusCode).render("error.ejs",{err })
    // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("server is running");
});
