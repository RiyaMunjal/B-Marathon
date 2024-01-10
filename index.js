// import http from "http"
// import fs from "fs"
// const Port=8000

// // const home=fs.readFileSync("./index.html")

// import { gfName } from "./features.js"
// console.log(gfName);

// const server=http.createServer((req, res)=>{
// if(req.url==="/"){
//     fs.readFile("./index.html", (err, data)=>{
//         res.end(data)
//     })
   
// }
// else if(req.url==="/about"){
//     res.end("<h1>about page </h1>")
// }
// else if(req.url==="/contact"){
//     res.end("<h1>contact page </h1>")
// }
// })

// server.listen(Port, ()=>{
//     console.log(`Port Number connected is : ${Port}`)
// })
import express from "express"
import path from "path"
import mongoose from "mongoose"
import e from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const app=express()

const userSchema=new mongoose.Schema({
    name: {
      type:String,
      required:true
    },
    email: String,
    password: String
  })
  
  const User=mongoose.model("User", userSchema);

const Instance=mongoose.connect(process.env.MONGO_DB_URI, {
    dbName:"backend"
})
.then(()=>{
console.log(`\n db connected Successfullly!!!!!`)
}).catch((error)=>{
    console.log(`Error : ${error}`)
})


//using middlewares
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

const users=[];

// set up view engine
app.set('view engine', 'ejs');

//middleware
const Authentication=async(req, res, next)=>{
    const {token}=req.cookies;
    if(token){
        const decoded=jwt.verify(token, "secretkey")
        // console.log(decoded)
       req.user= await User.findById(decoded.user_id)
        next();
    }
    else{
        res.redirect("/register");
    }
}

app.get('/', Authentication ,(req, res)=>{
    // const pathLocation=path.resolve();
    // console.log(path.join(pathLocation, "./index.html"))
    // res.sendFile(path.join(pathLocation, "./index.html"))
    // res.render("index.ejs", {"name":"Riya"})
    // console.log(token);
    console.log(req.user);
    res.render("logout", {name: req.user.name});
})

app.get("/register", (req, res)=>{
    res.render("register")
})

app.get("/login", (req, res)=>{
    res.render("login");
})

app.get("/logout", (req, res)=>{
    res.cookie("token", null,{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    res.redirect('/')

})

app.post("/register",async (req, res)=>{
    const {name, email,password}=req.body;

    let user= await User.findOne({email});
    if(user){
      return  res.redirect("/login")
    }
  const hashed_password= await bcrypt.hash("password",10);
    user=await User.create({
        name, 
        email,
        password:hashed_password
    }) 
    const token=jwt.sign({user_id:user._id},"secretkey");
       
    
        res.cookie("token", token,{
            httpOnly:true,
            expires:new Date(Date.now()+4000000)
        })
        res.redirect('/')


   
})

app.post("/login", async (req, res)=>{
    const {name, email, password}=req.body;
  
   let user= await User.findOne({email: email})
   if(!user){
   return res.redirect("/register")
   }
  const isMatch=  bcrypt.compare(password, user.password);

   if(! isMatch) return res.render("login", {email, message:"Incorrect Password"})
    const token=jwt.sign({user_id:user._id}, "secretkey");
    res.cookie("token", token, {
        httpOnly:true,
        expires:new Date(Date.now()+300000)
    })
    res.redirect('/')

})
// app.get("/success", (req, res)=>{
//     res.render("success")
// })

// app.post("/",async (req, res)=>{
//     console.log(req.body);
//     // users.push({name:req.body.name, email: req.body.email});
//     const {name, email}=req.body
//    await User.create({name,email})
//    .then(() =>{
//     res.send("Nice")
//     console.log(`db created`)})
//    .catch(()=>console.log(`Error : ${e}`))
//     // res.redirect("/success")
// })
// app.get("/users", (req, res)=>{
//     res.json({
//         users
//     })
// })
app.listen(process.env.PORT, ()=>{
    console.log(`listening on the PORT Number: ${process.env.PORT}`)
})