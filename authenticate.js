var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require("./model/user");

// export function supported by passport-local
// passport-local-mongoose proveide the authenticate function
// without it I have to write my own authenticate function
passport.use(new LocalStrategy(User.authenticate()));
// take care of whatever is needed for supporting session
// Serailize decides what info will be stored in the session
// deserialize helps retrieve the info from the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
