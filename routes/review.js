const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");

const ExpressError=require("../utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn } = require("../middleware.js");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }

  next();
};

const reviewController=require("../controllers/reviews.js");

//Reviews
//Post route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.post)
);
//delete Review route
router.delete("/:reviewId",
    wrapAsync(reviewController.delete));
    
module.exports=router;
