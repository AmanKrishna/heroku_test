const bodyParser = require('body-parser');
var User = require('../model/user');
var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup',function(req,res,next){
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
      // authenticate the same user to check if 
      // sighup was successful and this is the sytanx
      passport.authenticate('local')(req, res, ()=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success: true,status: "registration succeeded"});
      });
    }
  });
});

// when a login req comse the passport.authenticate
// will automatically send back a failure message
// and (req,res,next) will be executed after successful login
router.post('/login',passport.authenticate('local'),(req,res,next)=>{
  res.statusCode=200;
  res.setHeader('Content-Type','application/json');
  res.json({success: true,status: "You are successfully logged in"});
});

router.get('/logout',(req,res,next)=>{
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

module.exports = router;
