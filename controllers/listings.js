const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});
const hasValidCoordinates=(coordinates)=>Array.isArray(coordinates) &&
    coordinates.length===2 &&
    coordinates.every((value)=>Number.isFinite(Number(value))) &&
    Math.abs(Number(coordinates[0]))<=180 &&
    Math.abs(Number(coordinates[1]))<=90;


module.exports.index= async(req,res)=>{
     const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm=(req,res)=>{
    console.log(req.user);
    
    res.render("listings/new.ejs");
};

module.exports.show=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
        .populate({path:"reviews",populate:{path:"author"}})
        .populate("owner");
    if(!listing){
        req.flash("error","Listing Doesn't Exists!");
        return res.redirect("/listings");

    }

    // Seeded/older listings may not have coordinates yet. Geocode them the
    // first time they are viewed so the map can still be displayed.
    if (!hasValidCoordinates(listing.geometry?.coordinates) && mapToken && listing.location) {
        try {
            const response = await geocodingClient.forwardGeocode({
                query: [listing.location, listing.country].filter(Boolean).join(", "),
                limit: 1,
            }).send();
            const geometry = response.body.features[0]?.geometry;
            if (hasValidCoordinates(geometry?.coordinates)) {
                listing.geometry = geometry;
                await listing.save();
            } else {
                console.error(`No valid map coordinates found for listing ${listing._id}.`);
            }
        } catch (error) {
            console.error("Could not geocode listing for its map:", error.message);
        }
    }
    res.render("listings/show.ejs",{listing})
}

module.exports.createListing=async (req,res)=>{
    let response=await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
  .send()


    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    console.log(req.body.listing);
    //let{title,description,image,price,country,location}=req.body;
    newListing.geometry=response.body.features[0].geometry;
    let savedListing=await newListing.save();
    console.log(savedListing);
    req.flash("success","New listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you requested for does not exist!");
        req.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/,w_250");
    res.render("listings/edit.ejs",{listing:req.listing,originalImageUrl});
};

module.exports.updateListing=async(req,res)=>{
    

    let{id}=req.params;
    let listing =await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file!=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
     req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing=async(req,res)=>{
    let{id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(req.listing._id);
    console.log(deletedListing);
     req.flash("success","listing Delete!");
    res.redirect("/listings");
};
