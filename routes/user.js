const express = require("express");
const router = express.Router();
const User = require("../models/users.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport=require("passport");


router.route("/signup")
.get((req, res) => {
    res.render("users/signup.ejs");
})

.post( wrapAsync(async (req, res) => {
   try{const { username, email, password } = req.body;
    const user = await User.register(new User({ username, email }), password);

    await new Promise((resolve, reject) => {
        req.login(user, (err) => err ? reject(err) : resolve());
    });
    console.log(user);
    req.flash("success", "Welcome to StayEasy!");
    res.redirect("/listings");
   }
   catch(e){
    req.flash("error",e.message);
    res.redirect("/signup");
   }
}));

router.route("/login")
.get((req,res)=>{
    res.render("users/login.ejs");
})
.post(passport.authenticate("local",{failureRedirect:'/login',
    failureFlash:true
    }),wrapAsync(async(req,res)=>{
        req.flash("success", "Welcome back to StayEasy!");
        res.redirect("/listings");
}));


router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are Logged Out!");
        res.redirect("/listings");
    })
})
module.exports = router;
