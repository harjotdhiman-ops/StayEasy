const express=require("express");
const app=express();
const path=require("path");
const session=require("express-session");
const flash=require("connect-flash");
const sessionOptions={
    secret:"mysupersecretstring",
    resave:false,
    saveUninitialized:true,
};

app.set("view engine","ejs");
app.set("views", __dirname);

app.use(session(sessionOptions));
app.use(flash());


app.get("/register", (req,res)=>{
    let {name="anonymous"}=req.query;
    req.session.name=name;
    
    if(name==="anonymous"){
        req.flash("success","user registered successfully");
    }else{
        req.flash("error","user not registered");
 
    }
    res.redirect("/hello");
});

app.get("/hello",(req,res)=>{
    res.locals.successMsg=req.flash("success");
    res.locals.errorMsg=req.flash("error");
    res.render("page.ejs", {name:req.session.name});
});

// app.get("/reqcount",(req,res)=>{
//     if(req.session.count){
//         req.session.count++;
//     }else{
//         req.session.count=1;
//     }
//     res.send(`You sent a request ${req.session.count} times`);
// })

app.listen(3000,()=>{
    console.log("server is listening to 3000");
});
