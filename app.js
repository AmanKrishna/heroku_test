var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

// Get all the routers modeules
// They will handle the request for different routes/URLs
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

// connect to the database server
const mongoose = require('mongoose');
url = config.mongoUrl;
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

// use passport
app.use(passport.initialize());

// allowing new user to see index page as well as signup
app.use('/', indexRouter);
app.use('/users', usersRouter);

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
