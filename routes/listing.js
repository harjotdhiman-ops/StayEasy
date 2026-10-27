const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");

const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const {isLoggedIn}=require("../middleware.js");
const validateListing=(req,res,next)=>{
 if (req.file) {
    req.body.listing ??= {};
    req.body.listing.image = { url: req.file.path, filename: req.file.filename };
 } else if (req.method === "PUT" && req.body.listing && req.listing) {
    req.body.listing.image = req.listing.image.toObject
        ? req.listing.image.toObject()
        : req.listing.image;
 }
 let {error}=listingSchema.validate(req.body);
    console.log("result");
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error);
    }else{
        next();
    }
    
}
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({storage});

const listingController=require("../controllers/listings.js");
//middleware
const isOwner=wrapAsync(async(req,res,next)=>{
    const listing=await Listing.findById(req.params.id);
    if(!listing){
        req.flash("error","Listing Doesn't Exists!");
        return res.redirect("/listings");
    }
    if(!listing.owner || String(listing.owner)!==String(req.user._id)){
        req.flash("error","You don't have permission to do that.");
        return res.redirect(`/listings/${listing._id}`);
    }
    req.listing=listing;
    next();
});


//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/")
    .get(wrapAsync(listingController.index))// index route
    .post(//create route
    upload.single('image'),validateListing,isLoggedIn,
    wrapAsync (listingController.createListing));


//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
//show route
.get(wrapAsync (listingController.show))
.put(isLoggedIn,isOwner,upload.single('image'),validateListing,//update route
    wrapAsync (listingController.updateListing));

//edit route
router.get("/:id/edit",isLoggedIn,isOwner,listingController.renderEditForm);



//delete route
router.delete("/:id",isLoggedIn,isOwner,
    wrapAsync (listingController.deleteListing));

module.exports=router;
