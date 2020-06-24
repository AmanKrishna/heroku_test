const bodyParser = require('body-parser');
var User = require('../model/user');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup',function(req,res,next){
  // check if username already exist
  User.findOne({username: req.body.username})
  .then((user)=>{
    if(user!=null)
    {
      var err = new Error("USer already exists");
      err.status = 403;
      next(err);
    }
    else{
      return User.create({
        username: req.body.username,
        password: req.body.password
      })
    }
  })
  .then((user)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json({status: "registration succeeded",user:user});
  },(err)=>next(err))
  .catch((err)=>next(err));
});

router.post('/login',(req,res,next)=>{
  if(!req.session.user){
    var authHeader = req.headers.authorization;

    if(!authHeader){
      var err = new Error("You are not logged in!");
      res.setHeader('WWW-Authenticate','Basic');
      err.status=401;
      next(err);
      return;
    }
    // spliting the authheader using Buffer
    // authHeader = Basic UserName:Password
    // therefore [1]
    var auth = new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
    var username = auth[0];
    var password = auth[1];

    User.findOne({username:username})
    .then((user)=>{
      if(username===null)
      {
        var err = new Error("Username Doenot exists!");
        err.status=403;
        // call the errpr handler
        return next(err);
      }
      else if(user.password!==password)
      {
        var err = new Error("Incorrect Password!");
        err.status=403;
        // call the errpr handler
        return next(err);
      }
      else if(user.username===username && password===password){
        // set up the cookie on the client side
        req.session.user='authenticated';
        res.statusCode=200;
        res.setHeader('Content-Type','text/plain');
        res.end("You are authenticated!")
      }
    })
    .catch((err)=>next(err));
  }
  else{
    if(req.session.user === 'authenticated'){
      res.statusCode=200;
      res.setHeader('Content-Type','text/plain');
      res.end("You are already authenticated!")
    }
    else{
      var err = new Error("You are not authenticated!");
      err.status=403;
      // call the errpr handler
      return next(err);
    }
  }
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
