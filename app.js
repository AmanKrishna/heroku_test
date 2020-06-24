var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

// Get all the routers modeules
// They will handle the request for different routes/URLs
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

// connect to the database server
const mongoose = require('mongoose');
url = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(url);
connect.then((db)=>{
  console.log("Connnected to server!");
},
(err)=>{
  console.log(err);
});

// get Express framework to easify routing!
// and using 3rd party framework
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// using signed cookie
// app.use(cookieParser('12345-67890-0987-54321'));

// set session and define its parameters
app.use(session({
  name: 'session-id',
  secret: '12345-67890-0987-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

// allowing new user to see index page as well as signup
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Authorization Phase
function auth(req,res,next){
  console.log(req.session);
  // check if user is logged in
  if(!req.session.user){
    var err = new Error("You are not authenticated!");
    err.status=401;
    next(err);
    return;
  }
  else{
    if(req.session.user === 'authenticated'){
      next();
    }
    else{
      var err = new Error("You are not authenticated!");
      err.status=403;
      // call the errpr handler
      return next(err);
    }
  }
}

app.use(auth);

// serving public data from our server
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
