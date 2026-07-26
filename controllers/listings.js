const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});



module.exports.index = async(req,res)=>{
    try{
        const allListings = await Listing.find({});
        res.render("listings/index.ejs",{allListings});
    }
    catch(err){
        console.error("INDEX ERROR:");
        console.error(err);
        throw err;
    }
}

module.exports.searchListings = async(req,res)=>{
    try{
        const { q } = req.query;
        const searchQuery = q ? q.trim() : "";

        let filteredListings = [];

        if (searchQuery) {
            filteredListings = await Listing.find({
                $or: [
                    { title: { $regex: searchQuery, $options: "i" } },
                    { location: { $regex: searchQuery, $options: "i" } },
                    { country: { $regex: searchQuery, $options: "i" } }
                ]
            });
        } else {
            filteredListings = await Listing.find({});
        }

        res.json(filteredListings);
    }
    catch(err){
        console.error("SEARCH ERROR:");
        console.error(err);
        res.status(500).json({ error: "Search failed" });
    }
}
// module.exports.index = async(req,res) => {
//   const allListings = await Listing.find({});
//   res.render ("listings/index.ejs",{ allListings });
//  }

 module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Requested Listing does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

//  module.exports.createListing = async (req, res, next) => {
//     let url = req.file.path;
//     let filename = req.file.filename;

//     const newListing = new Listing(req.body.listing);    
//      newListing.owner = req.user._id;    
//      newListing.image = { url, filename };
//      await newListing.save();
//      req.flash("success", "New Listing Created!");
//      res.redirect("/listings");
//    };

module.exports.createListing = async(req, res, next) => {
  let response =await geocodingClient.forwardGeocode({
  query: `${req.body.listing.location}, ${req.body.listing.country}`,
  limit: 1,
})
  .send();
 // console.log("Geocoding response:", response.body);
  let url;
  let filename;
   if(req.file){
   url = req.file.path;
   filename = req.file.filename;
   }
   const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
      req.flash("success","New Listing Created!");
      res.redirect("/listings");
};


  module.exports.renderEditForm=async(req,res)=>{
      let {id} = req.params;
      const listing =await Listing.findById(id);
      if(!listing){
     req.flash("error","Listing requested for does not exist!");
     return res.redirect("/listings");
  }
     
     let originalImageUrl = listing.image.url;
     if (originalImageUrl) {
         originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
     }
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

 module.exports.updateListing = async (req,res)=>{
      let {id} = req.params;
      const listing = await Listing.findById(id);

      if(!listing){
        req.flash("error","Listing requested for does not exist!");
        return res.redirect("/listings");
      }

      const updatedData = { ...req.body.listing };

      if (updatedData.location || updatedData.country) {
        const response = await geocodingClient.forwardGeocode({
          query: `${updatedData.location || listing.location || ""}, ${updatedData.country || listing.country || ""}`,
          limit: 1,
        }).send();

        const feature = response.body?.features?.[0];
        if (feature?.geometry) {
          updatedData.geometry = feature.geometry;
        }
      }

      Object.assign(listing, updatedData);

     if(req.file){
    let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url,filename};
     }
      await listing.save();
      req.flash("success","Listing Updated!");
      res.redirect(`/listings/${id}`);
};


module.exports.destroyListing=async (req,res)=>{
      let {id} = req.params;
      let deletedListing = await Listing.findByIdAndDelete(id);
      console.log(deletedListing);
      req.flash("success","Listing Deleted!");
      res.redirect("/listings");
};

