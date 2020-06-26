const bodyParser = require('body-parser');
var User = require('../model/user');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate')

// calling cors
const cors = require("./cors");

/* GET users listing. */
router.route('/')
// if the client (browser) sends preflight request with options
.options(cors.corsWithOptions,(req,res)=>res.sendStatus=200)
.get(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) =>{
  User.find({})
  .then((users)=>{
    res.statusCode=200;
    res.setHeader('Content-type','application/json');
    res.json(users);    
  },(err)=>next(err))
  .catch((err)=>next(err));
});

router.post('/signup',cors.corsWithOptions,function(req,res,next){
  // check if username already exist
  User.register(new User({username: req.body.username}),
    req.body.password, (err,user)=>{
    if(err)
    {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else{
      // if the user is successfully registered
      // set the firstname and the lastname
      if(req.body.firstname)
        user.firstname = req.body.firstname;
      if(req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err,user)=>{
        // if there is an erro
        if(err){
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});  
          return;        
        }
        // authenticate the same user to check if 
        // sighup was successful and this is the sytanx
        passport.authenticate('local')(req, res, ()=>{
          res.statusCode=200;
          res.setHeader('Content-Type','application/json');
          res.json({success: true,status: "registration succeeded"});
        });
      });  
    }
  });
});

// when a login req comse the passport.authenticate
// will automatically send back a failure message
// and (req,res,next) will be executed after successful login
// create JWT token as well
router.post('/login',cors.corsWithOptions,passport.authenticate('local'),(req,res,next)=>{
  // create JWT token after succefull authentication
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode=200;
  res.setHeader('Content-Type','application/json');
  res.json({success: true,
    status: "You are successfully logged in",
    // send the JWT token
    token: token
  });
});

router.get('/logout',cors.corsWithOptions,(req,res,next)=>{
  if(req.session){
    // deleting the session from server side
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else{
    var err = new Error("You are not logged int!");
    err.status=403;
    return next(err);
  }
})

// here the user allows my website to access the fb access token.
// I take that token alongwith clientId and Secret using the passport.authenticate
// to verify my website with FB authentication server. The FB resource server then
// sends the resouces to the browser. The browsers forwards the resources
// to the server using req.
// If passport.authenticate('facebook-token') is successful then the req message
// will already contain the userid of the user logging/signing up through fb
router.get('/facebook/token',passport.authenticate('facebook-token'),(req,res)=>{
  if(req.user){
    // create the JWT token
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json({
      success: true,
      status: "You are successfully logged in",
      // send the JWT token
      token: token
    });
  }
});

module.exports = router;
