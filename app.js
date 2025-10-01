const express = require('express');
const app = express();
const userModel = require("./modules/user");
const psotModel = require("./modules/post");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// default route
app.get('/', (req, res) => {
    res.render("index");
});


// login route to login the old user 
app.get('/login' ,(req, res) => {
    res.render("login");
});


//this a post to tell that it is a progile route
app.get('/profile',isloggedin ,(req, res) => {
    console.log(req.user);
    res.render("login");
});

//register page for the checking if user exists or not
app.post('/register', async (req, res) => {
    let {email,password,username,name,age} = req.body;
    
    let user = await userModel.findOne({email});
    if(user) return res.status(500).send("User already exists");


    //gensalt is a method that will hash the password
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password, 10, async (err,hash)=>{     //here the .hash() accepcts 3 arguments password, rounds
           let user  = await userModel.create({
                username,
                email,
                age,
                password: hash
            })

            let token = jwt.sign({email:email , userid:user._id}, "sec");
            res.cookie("token",token);
            res.send("registered");
        })
    })

});

// post rpoute for the login page
app.post('/login', async (req, res) => {
    let {email,password} = req.body;

    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("Something went wrong");

    bcrypt.compare(password, user.password, (err,result) =>{
        if(result){
            let token = jwt.sign({email:email , userid:user._id}, "sec");
            res.cookie("token",token);
            res.status(200).send("you can login");
            
        } 
        else res.redirect("/login");
    })

});


// get route for the logout  path
app.get('/logout', (req, res) => {
    res.cookie("token","");
    res.redirect("/login");
});


//middleware here for the profile page  is (islogedin)
function isloggedin(req,res,next){
    if(req.cookies.token === "") res.send("You must login first");
    else{
        let data = jwt.verify(req.cookies.token, "sec");
        req.user = data;
        next();
    }
}

app.listen(3000);  
