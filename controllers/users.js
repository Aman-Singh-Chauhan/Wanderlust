 
 const User=require("../models/user");
 const Listing = require("../models/listing");
 
 module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// module.exports.renderDashboard = async (req, res) => {
//     const profileUser = req.user;
//     const listings = await Listing.find({ owner: profileUser._id }).populate("owner");
//     res.render("users/profile.ejs", { profileUser, listings });
// };

// module.exports.renderProfile = async (req, res) => {
//     const { username } = req.params;
//     const profileUser = await User.findOne({ username });

//     if (!profileUser) {
//         req.flash("error", "User not found!");
//         return res.redirect("/listings");
//     }

//     const listings = await Listing.find({ owner: profileUser._id }).populate("owner");
//     res.render("users/profile.ejs", { profileUser, listings });
// };
 
 
 module.exports.signup=async(req,res,next)=>{
        try{
    let{username,email,password}=req.body;
    const newUser=new User({email,username});
  const registeredUser = await User.register(newUser,password);
  console.log(registeredUser);
  req.login(registeredUser,(err)=>{
    if(err){
        return next(err);
    }
       req.flash("success","Welcome to Wanderlust!");
  res.redirect("/listings");   
  })
        }
        catch(e){
            req.flash("error",e.message);
        res.redirect("/signup");
        }
    };

   module.exports.login=async(req,res)=>{
    req.flash("success","Welcome back to Wanderlust!");
    let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
            req.flash("success","you are logged out!");
            res.redirect("/listings");
        
    });
};