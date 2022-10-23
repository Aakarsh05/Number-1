const express=require("express");
const bodyParser=require("body-parser");
const ejs =require("ejs");
var multer =require('multer');
const fs=require("fs");
const path=require("path");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
var imgModel = require('./models');

let orgi="";
let newPass="";
let userID="";
mongoose.connect("mongodb://localhost:27017/UserDB");

const userSchema =new mongoose.Schema({
    Id: String,
    email: String,
    password: String,
});

const User=mongoose.model("User", userSchema);

var storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads')
    },
    filename:(req,file,cb)=>
    {
        cb(null,file.fieldname+'_'+Date.now())
    }
});


var uploads =multer({storage:storage});

app.get('/Cart', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('Cart', { items: items });
        }
    });
});

app.post('/Cart', uploads.single('image'), (req, res, next) => {
  
    var obj = {
        name: req.body.name,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/Cart');
        }
    });
});

app.get("/",function(req, res)
{
    res.render("Home");
});
app.get("/account",function(req,res)
{
    res.render("account",{ report1: orgi, writen: newPass});
});
app.post("/register",function(req,res)
{
    let username=req.body.user;
    let email = req.body.email;
    let password = req.body.passKey;
    console.log(username,email,password);
    const user=new User({
        Id:username,
        email:email,
        password:password
    });
    user.save(function(err)
    {
        if(!err)
        {
            res.redirect("/account");
        }
    });
});
app.post("/account",function(req, res)
{
    let username=req.body.User_ID;
    let userpassword = req.body.passKey;
    console.log(username,userpassword);
    User.findOne({Id: username},function(err,foundItem)
    {
        console.log(foundItem.password);
        if(!err)
        {
            if(foundItem.password === userpassword && foundItem.Id === username)
            {
                res.redirect("/");
            }
            else
            {
                 orgi="Check the password or Username";
                 res.redirect("/account");
            }
        }
    });
});
app.get("/Product",function(req,res)
{
    res.render("Product");
});
app.get("/Chef",function(req,res)
{
    res.render("Chef");
});
app.get("/product_details",function(req,res)
{
    res.render("product_details");
});
app.listen(3000,function(req, res)
{
    console.log("Server running at http://localhost:3000");
});